/**
 * Scratch Memory - Short-term working memory and current state
 * 
 * Holds the persona's immediate state, goals, and plans
 */

export interface DailyPlan {
  wakeUpHour: number;
  requirements: string[];
  schedule: Array<{
    time: string;
    activity: string;
  }>;
}

export class Scratch {
  // Vision and attention
  visionR: number = 4; // Vision radius
  attBandwidth: number = 3; // How many events can be processed
  retention: number = 5; // How long events are retained

  // Current state
  currTile: [number, number] = [0, 0];
  currTime: Date = new Date();
  currAddress: string = '';
  currAction: string = '';

  // Identity (ISS = Identity Stable State)
  name: string = '';
  firstName: string = '';
  age: number = 0;
  innate: string = ''; // Core personality traits
  learned: string = ''; // Learned traits
  currently: string = ''; // Current daily routine
  lifestyle: string = ''; // Overall lifestyle description

  // Planning
  dailyPlan: DailyPlan | null = null;
  actPath: [number, number][] = []; // Path to follow
  actDescription: string = '';
  actEvent: [string, number] | null = null; // [description, duration]

  // Memory management
  conceptForget: number = 100; // How long before concepts expire (steps)

  // Reflection
  lastReflection: Date = new Date();
  reflectionThreshold: number = 10; // Trigger reflection after N events

  constructor(init?: Partial<Scratch>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  /**
   * Get string representation of identity
   */
  getStrISS(): string {
    return `Name: ${this.name}\nAge: ${this.age}\nInnate: ${this.innate}\nLearned: ${this.learned}\nCurrently: ${this.currently}`;
  }

  /**
   * Get lifestyle description
   */
  getStrLifestyle(): string {
    return this.lifestyle;
  }

  /**
   * Get first name
   */
  getStrFirstname(): string {
    return this.firstName;
  }

  /**
   * Get current address string
   */
  getCurrAddress(): string {
    return this.currAddress;
  }

  /**
   * Set current address
   */
  setCurrAddress(address: string): void {
    this.currAddress = address;
  }

  /**
   * Serialize to JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      visionR: this.visionR,
      attBandwidth: this.attBandwidth,
      retention: this.retention,
      currTile: this.currTile,
      currTime: this.currTime.toISOString(),
      currAddress: this.currAddress,
      currAction: this.currAction,
      name: this.name,
      firstName: this.firstName,
      age: this.age,
      innate: this.innate,
      learned: this.learned,
      currently: this.currently,
      lifestyle: this.lifestyle,
      dailyPlan: this.dailyPlan,
      actPath: this.actPath,
      actDescription: this.actDescription,
      actEvent: this.actEvent,
      conceptForget: this.conceptForget,
      lastReflection: this.lastReflection.toISOString(),
      reflectionThreshold: this.reflectionThreshold,
    };
  }

  /**
   * Deserialize from JSON
   */
  static fromJSON(data: Record<string, unknown>): Scratch {
    return new Scratch({
      visionR: data.visionR as number,
      attBandwidth: data.attBandwidth as number,
      retention: data.retention as number,
      currTile: data.currTile as [number, number],
      currTime: new Date(data.currTime as string),
      currAddress: data.currAddress as string,
      currAction: data.currAction as string,
      name: data.name as string,
      firstName: data.firstName as string,
      age: data.age as number,
      innate: data.innate as string,
      learned: data.learned as string,
      currently: data.currently as string,
      lifestyle: data.lifestyle as string,
      dailyPlan: data.dailyPlan as DailyPlan | null,
      actPath: data.actPath as [number, number][],
      actDescription: data.actDescription as string,
      actEvent: data.actEvent as [string, number] | null,
      conceptForget: data.conceptForget as number,
      lastReflection: new Date(data.lastReflection as string),
      reflectionThreshold: data.reflectionThreshold as number,
    });
  }
}
