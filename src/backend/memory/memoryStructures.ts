/**
 * Memory Structures for Generative Agents
 * 
 * Core data structures for agent memory:
 * - ConceptNode: Individual memory unit (event, thought, conversation)
 * - AssociativeMemory: Long-term episodic memory
 * - SpatialMemory: Hierarchical spatial knowledge
 * - Scratch: Short-term working memory
 */

export interface ConceptNode {
  // Triple representation: Subject-Predicate-Object
  subject: string;
  predicate: string;
  object: string;
  
  // Full description
  description: string;
  
  // Metadata
  createdAt: Date;
  expirationDate: Date;
  lastAccessed: Date;
  
  // Importance and keywords
  poignancy: number; // Emotional importance (0-10)
  keywords: Set<string>;
  
  // Embeddings for similarity search
  embedding: number[];
  embeddingKey: string;
  
  // Type classification
  nodeType: 'event' | 'thought' | 'chat';
  
  // Counts
  nodeCount: number;
  typeCount: number;
  depth: number;
  
  // Additional properties
  filling: string[];
}

export class ConceptNodeImpl implements ConceptNode {
  subject: string;
  predicate: string;
  object: string;
  description: string;
  createdAt: Date;
  expirationDate: Date;
  lastAccessed: Date;
  poignancy: number;
  keywords: Set<string>;
  embedding: number[];
  embeddingKey: string;
  nodeType: 'event' | 'thought' | 'chat';
  nodeCount: number;
  typeCount: number;
  depth: number;
  filling: string[];

  constructor(
    node: Partial<ConceptNode> & Pick<ConceptNode, 'subject' | 'predicate' | 'object' | 'description'>
  ) {
    this.subject = node.subject;
    this.predicate = node.predicate;
    this.object = node.object;
    this.description = node.description;
    this.createdAt = node.createdAt ?? new Date();
    this.expirationDate = node.expirationDate ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    this.lastAccessed = node.lastAccessed ?? new Date();
    this.poignancy = node.poignancy ?? 5;
    this.keywords = node.keywords ?? new Set();
    this.embedding = node.embedding ?? [];
    this.embeddingKey = node.embeddingKey ?? '';
    this.nodeType = node.nodeType ?? 'event';
    this.nodeCount = node.nodeCount ?? 0;
    this.typeCount = node.typeCount ?? 0;
    this.depth = node.depth ?? 0;
    this.filling = node.filling ?? [];
  }

  /**
   * Get the SPO (Subject-Predicate-Object) triple as a string
   */
  getSPO(): string {
    return `${this.subject}:${this.predicate}:${this.object}`;
  }

  /**
   * Check if the node has expired
   */
  hasExpired(): boolean {
    return new Date() > this.expirationDate;
  }

  /**
   * Update last accessed time
   */
  touch(): void {
    this.lastAccessed = new Date();
  }

  /**
   * Serialize to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      subject: this.subject,
      predicate: this.predicate,
      object: this.object,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      expirationDate: this.expirationDate.toISOString(),
      lastAccessed: this.lastAccessed.toISOString(),
      poignancy: this.poignancy,
      keywords: Array.from(this.keywords),
      embedding: this.embedding,
      embeddingKey: this.embeddingKey,
      nodeType: this.nodeType,
      nodeCount: this.nodeCount,
      typeCount: this.typeCount,
      depth: this.depth,
      filling: this.filling,
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data: Record<string, unknown>): ConceptNodeImpl {
    return new ConceptNodeImpl({
      subject: data.subject as string,
      predicate: data.predicate as string,
      object: data.object as string,
      description: data.description as string,
      createdAt: new Date(data.createdAt as string),
      expirationDate: new Date(data.expirationDate as string),
      lastAccessed: new Date(data.lastAccessed as string),
      poignancy: data.poignancy as number,
      keywords: new Set(data.keywords as string[]),
      embedding: data.embedding as number[],
      embeddingKey: data.embeddingKey as string,
      nodeType: data.nodeType as 'event' | 'thought' | 'chat',
      nodeCount: data.nodeCount as number,
      typeCount: data.typeCount as number,
      depth: data.depth as number,
      filling: data.filling as string[],
    });
  }
}

/**
 * Associative Memory - Long-term episodic memory storage
 * Uses keyword indexing and vector similarity for efficient retrieval
 */
export class AssociativeMemory {
  // Sequential storage by type
  private seqEvent: ConceptNodeImpl[] = [];
  private seqThought: ConceptNodeImpl[] = [];
  private seqChat: ConceptNodeImpl[] = [];

  // Keyword to node mappings for fast retrieval
  private kwToEvent: Map<string, Set<number>> = new Map();
  private kwToThought: Map<string, Set<number>> = new Map();
  private kwToChat: Map<string, Set<number>> = new Map();

  // ID mappings
  private idToNode: Map<number, ConceptNodeImpl> = new Map();

  // Counters
  private nodeCount = 0;

  constructor() {}

  /**
   * Add a concept node to memory
   */
  addNode(node: ConceptNodeImpl): number {
    const id = this.nodeCount++;
    node.nodeCount = id;

    // Store in appropriate sequence
    switch (node.nodeType) {
      case 'event':
        node.typeCount = this.seqEvent.length;
        this.seqEvent.push(node);
        this._indexKeywords(node, this.kwToEvent);
        break;
      case 'thought':
        node.typeCount = this.seqThought.length;
        this.seqThought.push(node);
        this._indexKeywords(node, this.kwToThought);
        break;
      case 'chat':
        node.typeCount = this.seqChat.length;
        this.seqChat.push(node);
        this._indexKeywords(node, this.kwToChat);
        break;
    }

    this.idToNode.set(id, node);
    return id;
  }

  /**
   * Index keywords for a node
   */
  private _indexKeywords(node: ConceptNodeImpl, kwMap: Map<string, Set<number>>): void {
    for (const keyword of node.keywords) {
      if (!kwMap.has(keyword)) {
        kwMap.set(keyword, new Set());
      }
      kwMap.get(keyword)!.add(node.nodeCount);
    }
  }

  /**
   * Retrieve nodes by keywords
   */
  retrieveByKeywords(
    keywords: string[],
    nodeType: 'event' | 'thought' | 'chat' | 'all' = 'all'
  ): ConceptNodeImpl[] {
    const nodeIds = new Set<number>();

    const maps =
      nodeType === 'all'
        ? [this.kwToEvent, this.kwToThought, this.kwToChat]
        : nodeType === 'event'
        ? [this.kwToEvent]
        : nodeType === 'thought'
        ? [this.kwToThought]
        : [this.kwToChat];

    for (const kwMap of maps) {
      for (const keyword of keywords) {
        const ids = kwMap.get(keyword);
        if (ids) {
          for (const id of ids) {
            nodeIds.add(id);
          }
        }
      }
    }

    return Array.from(nodeIds)
      .map((id) => this.idToNode.get(id)!)
      .filter(Boolean);
  }

  /**
   * Get all nodes of a specific type
   */
  getNodesByType(nodeType: 'event' | 'thought' | 'chat'): ConceptNodeImpl[] {
    switch (nodeType) {
      case 'event':
        return [...this.seqEvent];
      case 'thought':
        return [...this.seqThought];
      case 'chat':
        return [...this.seqChat];
    }
  }

  /**
   * Get all nodes
   */
  getAllNodes(): ConceptNodeImpl[] {
    return [...this.seqEvent, ...this.seqThought, ...this.seqChat];
  }

  /**
   * Get node by ID
   */
  getNode(id: number): ConceptNodeImpl | undefined {
    return this.idToNode.get(id);
  }

  /**
   * Get total node count
   */
  getNodeCount(): number {
    return this.nodeCount;
  }

  /**
   * Serialize to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      seqEvent: this.seqEvent.map((n) => n.toJSON()),
      seqThought: this.seqThought.map((n) => n.toJSON()),
      seqChat: this.seqChat.map((n) => n.toJSON()),
      nodeCount: this.nodeCount,
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data: Record<string, unknown>): AssociativeMemory {
    const memory = new AssociativeMemory();
    memory.nodeCount = (data.nodeCount as number) ?? 0;

    // Restore events
    for (const nodeData of (data.seqEvent as Record<string, unknown>[]) ?? []) {
      const node = ConceptNodeImpl.fromJSON(nodeData);
      memory.seqEvent.push(node);
      memory.idToNode.set(node.nodeCount, node);
      memory._indexKeywords(node, memory.kwToEvent);
    }

    // Restore thoughts
    for (const nodeData of (data.seqThought as Record<string, unknown>[]) ?? []) {
      const node = ConceptNodeImpl.fromJSON(nodeData);
      memory.seqThought.push(node);
      memory.idToNode.set(node.nodeCount, node);
      memory._indexKeywords(node, memory.kwToThought);
    }

    // Restore chats
    for (const nodeData of (data.seqChat as Record<string, unknown>[]) ?? []) {
      const node = ConceptNodeImpl.fromJSON(nodeData);
      memory.seqChat.push(node);
      memory.idToNode.set(node.nodeCount, node);
      memory._indexKeywords(node, memory.kwToChat);
    }

    return memory;
  }
}

/**
 * Spatial Memory - Hierarchical spatial knowledge tree
 * Structure: World → Sector → Arena → Game Objects
 */
export type SpatialMemoryTree = {
  [world: string]: {
    [sector: string]: {
      [arena: string]: string[]; // game objects
    };
  };
};

export class SpatialMemory {
  private tree: SpatialMemoryTree = {};

  constructor(tree?: SpatialMemoryTree) {
    if (tree) {
      this.tree = tree;
    }
  }

  /**
   * Add or update a spatial path
   */
  addPath(world: string, sector: string, arena: string, gameObject?: string): void {
    if (!this.tree[world]) {
      this.tree[world] = {};
    }
    if (!this.tree[world]![sector]) {
      this.tree[world]![sector] = {};
    }
    if (!this.tree[world]![sector]![arena]) {
      this.tree[world]![sector]![arena] = [];
    }
    if (gameObject && !this.tree[world]![sector]![arena]!.includes(gameObject)) {
      this.tree[world]![sector]![arena]!.push(gameObject);
    }
  }

  /**
   * Check if a path exists
   */
  hasPath(world: string, sector?: string, arena?: string, gameObject?: string): boolean {
    if (!this.tree[world]) return false;
    if (!sector) return true;

    if (!this.tree[world]![sector]) return false;
    if (!arena) return true;

    if (!this.tree[world]![sector]![arena]) return false;
    if (!gameObject) return true;

    return this.tree[world]![sector]![arena]!.includes(gameObject);
  }

  /**
   * Get all worlds
   */
  getWorlds(): string[] {
    return Object.keys(this.tree);
  }

  /**
   * Get all sectors in a world
   */
  getSectors(world: string): string[] {
    return Object.keys(this.tree[world] ?? {});
  }

  /**
   * Get all arenas in a sector
   */
  getArenas(world: string, sector: string): string[] {
    return Object.keys(this.tree[world]?.[sector] ?? {});
  }

  /**
   * Get all objects in an arena
   */
  getObjects(world: string, sector: string, arena: string): string[] {
    return this.tree[world]?.[sector]?.[arena] ?? [];
  }

  /**
   * Get the full tree
   */
  getTree(): SpatialMemoryTree {
    return this.tree;
  }

  /**
   * Serialize to JSON
   */
  toJSON(): SpatialMemoryTree {
    return this.tree;
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data: SpatialMemoryTree): SpatialMemory {
    return new SpatialMemory(data);
  }
}
