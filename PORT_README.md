# Generative Agents - Node.js/Bun.js Port

## 🎉 Project Summary

This repository contains a **modern TypeScript/Node.js/Bun.js port** of the Generative Agents research project, originally implemented in Python. The port uses **OpenRouter** as the LLM backend, providing access to multiple AI providers (OpenAI, Anthropic, Google, Meta, and more) through a unified API.

## 📚 Quick Links

- **[Setup & Installation](README_NODEJS.md)** - Get started quickly
- **[Implementation Status](IMPLEMENTATION_STATUS.md)** - See what's done and what's coming
- **[Migration Guide](MIGRATION_GUIDE.md)** - Switch from Python version
- **[Original Paper](https://arxiv.org/abs/2304.03442)** - Research background

## ✨ Highlights

### What's Completed (Foundation - ~35%)

✅ **Modern Project Setup**
- TypeScript with strict type checking
- ES2022+ modules (ESM)
- Bun.js/Node.js 20+ runtime
- ESLint + Prettier
- Environment-based configuration

✅ **API Integration**
- OpenRouter client (multi-provider LLM access)
- Chat completions
- Safe generation with retry logic
- Embeddings support
- Rate limiting

✅ **Core Memory Systems**
- ConceptNode (individual memories)
- AssociativeMemory (long-term storage)
- SpatialMemory (hierarchical world knowledge)
- Scratch (short-term working memory)

✅ **Utility Functions**
- File I/O operations
- CSV read/write
- Vector mathematics
- Date/time handling

✅ **Web Servers**
- Express.js frontend (port 8000)
- Backend simulation server (port 3000)
- Health check endpoints
- Basic routing

### What's Next (Core Implementation)

🚧 **Simulation Engine**
- Maze/world representation
- Pathfinding
- Collision detection

🚧 **Cognitive Modules**
- Perceive (event detection)
- Retrieve (memory access)
- Plan (decision making)
- Reflect (meta-cognition)
- Execute (action execution)
- Converse (dialogue)

🚧 **Persona System**
- Agent controller
- Move cycle orchestration
- State management

🚧 **Prompt Templates**
- Port 30+ GPT prompt functions
- Template file migration

🚧 **Visualization**
- Canvas-based map
- Agent sprites
- Real-time updates

## 🚀 Quick Start

### Prerequisites
```bash
# Install Bun (recommended)
curl -fsSL https://bun.sh/install | bash

# Or use Node.js 20+
node --version  # should be >= 20.0.0
```

### Setup
```bash
# Clone repository
git clone https://github.com/shelbeely/generative_agents.git
cd generative_agents

# Install dependencies
bun install  # or: npm install

# Configure
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

### Run
```bash
# Terminal 1: Frontend Server
bun run dev:frontend

# Terminal 2: Backend Server  
bun run dev

# Visit http://localhost:8000
```

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Express Frontend                       │
│                    (Port 8000)                           │
│  - Health checks                                         │
│  - Simulation viewer                                     │
│  - Replay/Demo modes                                     │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTP/WebSocket
                           │
┌─────────────────────────────────────────────────────────┐
│              TypeScript Backend Server                   │
│                   (Port 3000)                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Simulation Engine                    │  │
│  │  ├─ Maze (world/environment)                     │  │
│  │  ├─ Personas (agents)                            │  │
│  │  └─ Game loop                                    │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Cognitive Modules                        │  │
│  │  ├─ Perceive  ├─ Retrieve  ├─ Plan              │  │
│  │  ├─ Reflect   ├─ Execute   └─ Converse          │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Memory Structures                       │  │
│  │  ├─ AssociativeMemory (long-term)               │  │
│  │  ├─ SpatialMemory (spatial)                     │  │
│  │  └─ Scratch (working memory)                    │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           │
┌─────────────────────────────────────────────────────────┐
│                  OpenRouter API                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  OpenAI  │  Anthropic  │  Google  │  Meta  │ ... │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🔑 Key Features

### 1. Multi-Provider LLM Access
Use any model via OpenRouter:
- OpenAI GPT-4, GPT-3.5
- Anthropic Claude 3
- Google Gemini Pro
- Meta Llama 3
- Mistral, Cohere, and more

### 2. Modern TypeScript
- Full type safety
- IntelliSense support
- Catch errors at compile time
- Better refactoring

### 3. Fast Runtime
- Bun.js: 2-3x faster startup
- Native TypeScript execution
- Optimized for performance

### 4. Developer Experience
- Hot reload during development
- ESLint + Prettier
- Clear error messages
- Environment-based config

## 📦 Project Structure

```
generative_agents/
├── src/
│   ├── backend/          # Backend simulation server
│   │   ├── memory/       # Memory structures
│   │   ├── cognitive/    # Cognitive modules (TODO)
│   │   ├── persona/      # Agent logic (TODO)
│   │   └── reverie.ts    # Main server
│   ├── frontend/         # Frontend web server
│   │   └── server.ts     # Express app
│   ├── utils/            # Shared utilities
│   ├── config.ts         # Configuration
│   └── openrouter.ts     # API client
├── environment/          # Game assets & storage
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .env.example          # Config template
├── README_NODEJS.md      # Setup guide
├── IMPLEMENTATION_STATUS.md  # Progress tracker
└── MIGRATION_GUIDE.md    # Python → Node.js guide
```

## 🔬 Research Context

This port maintains the architecture from the original research paper:

**"Generative Agents: Interactive Simulacra of Human Behavior"**  
Park et al., UIST 2023

The system simulates believable human-like agents with:
- Memory and recall
- Planning and goals
- Social interactions
- Personality traits
- Emergent behaviors

## 💡 Why This Port?

### Advantages of Node.js/Bun.js
1. **Performance**: Faster startup, lower memory
2. **Ecosystem**: Rich npm packages
3. **Deployment**: Easy cloud deployment
4. **WebSockets**: Native real-time support
5. **Modern**: Latest JavaScript features

### Advantages of OpenRouter
1. **Choice**: 50+ models from 10+ providers
2. **Cost**: Competitive pricing
3. **Unified**: One API for all providers
4. **Fallbacks**: Automatic model switching
5. **Dashboard**: Usage tracking and analytics

## 🧪 Current Status

**Version**: 2.0.0-alpha  
**Completion**: ~35%  
**Status**: Foundation complete, core implementation in progress

### Can Do Now
✅ Run frontend server  
✅ Run backend server  
✅ Test API connection  
✅ Use memory structures  
✅ Call OpenRouter models  

### Coming Soon
🚧 Full simulation engine  
🚧 Agent cognitive modules  
🚧 Map visualization  
🚧 Complete persona behaviors  
🚧 Save/load simulations  

## 🤝 Contributing

We welcome contributions! Areas that need help:

1. **Cognitive Modules**: Port Python logic to TypeScript
2. **Prompt Templates**: Migrate template files
3. **Maze System**: Implement world representation
4. **Testing**: Add unit and integration tests
5. **Documentation**: Improve guides and examples

See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) for detailed task list.

## 📄 License

MIT License - See [LICENSE](LICENSE) file

## 🙏 Credits

**Original Research**:
- Joon Sung Park (Stanford)
- Joseph C. O'Brien, Carrie J. Cai
- Meredith Ringel Morris, Percy Liang
- Michael S. Bernstein

**Game Assets**:
- PixyMoon (background art)
- LimeZu (furniture/interiors)
- ぴぽ (character design)

**Node.js/Bun.js Port**:
- Community contributors

## 📞 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Original Paper**: https://arxiv.org/abs/2304.03442
- **OpenRouter**: https://openrouter.ai/docs

---

⭐ **Star this repo if you find it useful!**  
🔀 **Fork it to contribute!**  
💬 **Join discussions to share ideas!**
