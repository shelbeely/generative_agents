# Generative Agents: Interactive Simulacra of Human Behavior (Node.js/Bun.js Port)

<p align="center" width="100%">
<img src="cover.png" alt="Smallville" style="width: 80%; min-width: 300px; display: block; margin: auto;">
</p>

This is a **modern Node.js/Bun.js port** of the [Generative Agents](https://arxiv.org/abs/2304.03442) research project, using **TypeScript** and **OpenRouter** as the LLM backend. This port follows 2025 web development standards and best practices.

## 🚀 What's New in This Port

- ✅ **TypeScript** for type safety and better developer experience
- ✅ **Bun.js** runtime for blazing-fast performance
- ✅ **OpenRouter API** supporting multiple LLM providers (OpenAI, Anthropic, Google, etc.)
- ✅ **Modern ESM modules** (ES2022+)
- ✅ **Express.js** for the frontend server (replacing Django)
- ✅ **Zero Python dependencies** - Pure Node.js/TypeScript implementation

## 📋 Prerequisites

- **Bun.js** v1.0+ or **Node.js** v20+ 
- **OpenRouter API Key** (get one at [openrouter.ai](https://openrouter.ai))

## 🛠️ Installation

### 1. Install Dependencies

You can use either **Bun.js** (faster) or **Node.js** (more compatible):

**Option A: With Bun (Recommended)**
```bash
# Install Bun if not already installed
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install
```

**Option B: With Node.js**
```bash
# Requires Node.js v20+
npm install
```

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/shelbeely/generative_agents.git
cd generative_agents

# Install dependencies (REQUIRED before running)
npm install
# OR
bun install
```

> **⚠️ Important:** You must run `npm install` or `bun install` before running any scripts. This installs TypeScript, type definitions, and all dependencies.

### 3. Configure Environment

Copy the example environment file and add your OpenRouter API key:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:

```env
# Required: Your OpenRouter API key
OPENROUTER_API_KEY=your_api_key_here

# Recommended 2026: Use DeepSeek-V3.2 for agentic systems
DEFAULT_MODEL=deepseek/deepseek-chat
ADVANCED_MODEL=deepseek/deepseek-chat
FAST_MODEL=google/gemini-3-flash
VISION_MODEL=google/gemini-3-flash

# Alternative: Use Gemini 3 series
# DEFAULT_MODEL=google/gemini-3-flash
# ADVANCED_MODEL=google/gemini-3-pro

# Optional: Your name
KEY_OWNER=Your Name
```

### 4. Start the Servers

You'll need to run two servers concurrently:

**Terminal 1 - Frontend Server:**
```bash
# With Bun
bun run dev:frontend

# OR with Node.js
npx tsx src/frontend/server.ts
```

**Terminal 2 - Backend Simulation Server:**
```bash
# With Bun
bun run dev

# OR with Node.js
npx tsx src/backend/reverie.ts
```

### 5. Verify Installation

Before running the servers, verify your setup:

```bash
# Check TypeScript compilation
npm run type-check

# Check code style
npm run lint
```

Both commands should complete with no errors.

## 🎮 Running a Simulation

### 1. Check Frontend Server

Open your browser and navigate to:
```
http://localhost:8000/
```

You should see: "Your environment server is up and running"

### 2. Start a Simulation

In the backend server terminal, you'll be prompted:

```
Enter the name of the forked simulation:
```

Type: `base_the_ville_isabella_maria_klaus` (for a 3-agent simulation)

Then enter a name for your new simulation:
```
Enter the name of the new simulation:
```

Type: `test-simulation`

### 3. Run the Simulation

When prompted with `Enter option:`, type:

```
run 100
```

This will simulate 100 game steps (1 step = 10 seconds of game time).

### 4. View the Simulation

Navigate to:
```
http://localhost:8000/simulator_home
```

You'll see the map of Smallville with agents moving around!

### 5. Save and Exit

- Type `fin` to save and exit
- Type `exit` to exit without saving
- Type `run <steps>` to continue the simulation

## 🎯 Replay a Simulation

Visit:
```
http://localhost:8000/replay/<simulation-name>/1/
```

For example:
```
http://localhost:8000/replay/July1_the_ville_isabella_maria_klaus-step-3-20/1/
```

## 🎬 Demo Mode

Visit:
```
http://localhost:8000/demo/<simulation-name>/<start-step>/<speed>/
```

Where speed is 1 (slowest) to 5 (fastest):
```
http://localhost:8000/demo/July1_the_ville_isabella_maria_klaus-step-3-20/1/3/
```

## 🔧 Development

### Build for Production

```bash
bun run build
```

### Type Checking

```bash
bun run type-check
```

### Linting

```bash
bun run lint
```

### Formatting

```bash
bun run format
```

## 📁 Project Structure

```
├── src/
│   ├── backend/          # Backend simulation server
│   │   ├── persona/      # Agent cognitive modules
│   │   ├── maze.ts       # World/environment logic
│   │   └── reverie.ts    # Main simulation server
│   ├── frontend/         # Frontend web server (Express)
│   │   └── server.ts
│   ├── utils/            # Shared utilities
│   │   └── globalMethods.ts
│   ├── config.ts         # Configuration management
│   └── openrouter.ts     # OpenRouter API client
├── environment/          # Game assets and storage
├── package.json
├── tsconfig.json
└── .env                  # Your configuration (not in git)
```

## 🌐 OpenRouter Models

This port supports any model available on OpenRouter. Some popular options:

### 2026 Recommended Models

**For Generative Agents (Best Choice):**
- `deepseek/deepseek-chat` - **⭐ NEW: DeepSeek-V3.2** - GPT-5 class reasoning, exceptional tool use, cost-effective
- `google/gemini-3-flash` - Fast, excellent vision, real-time performance
- `google/gemini-3-pro` - Best quality, 1M token context, multimodal

**Classic Options:**
- `openai/gpt-5` - Most capable (when available), premium
- `openai/gpt-4` - Highly capable, slower
- `openai/gpt-3.5-turbo` - Fast and cost-effective
- `anthropic/claude-4.5-opus` - Anthropic's latest
- `meta-llama/llama-3.2-90b-vision` - Open source with vision

Configure these in your `.env` file.

### Why DeepSeek-V3.2?

DeepSeek-V3.2 is specifically designed for agentic systems:
- **GPT-5 class performance** at fraction of cost
- **Exceptional tool-use** compliance
- **Gold medal** results on IMO/IOI 2025
- **DeepSeek Sparse Attention** for efficiency
- **Perfect for multi-step** agent reasoning

See [DEEPSEEK_GUIDE.md](DEEPSEEK_GUIDE.md) for detailed integration guide.
See [MODERN_MODELS_2026.md](MODERN_MODELS_2026.md) for complete model comparison.

## 💡 Tips

- Simulations can be expensive - save often!
- **2026 Update:** Use `deepseek/deepseek-chat` for best agentic performance at low cost
- Use `google/gemini-3-flash` for fast development/testing with vision
- Upgrade to `google/gemini-3-pro` for best quality with large context
- OpenRouter provides unified billing across all providers
- See [DEEPSEEK_GUIDE.md](DEEPSEEK_GUIDE.md) for optimization strategies

## 📚 Original Research

This port maintains the architecture and behavior of the original research:

**Paper:** [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442)

**Authors:** Joon Sung Park, Joseph C. O'Brien, Carrie J. Cai, Meredith Ringel Morris, Percy Liang, Michael S. Bernstein

**Citation:**
```bibtex
@inproceedings{Park2023GenerativeAgents,  
  author = {Park, Joon Sung and O'Brien, Joseph C. and Cai, Carrie J. and Morris, Meredith Ringel and Liang, Percy and Bernstein, Michael S.},  
  title = {Generative Agents: Interactive Simulacra of Human Behavior},  
  year = {2023},  
  publisher = {Association for Computing Machinery},  
  booktitle = {UIST '23}
}
```

## 🤝 Contributing

Contributions are welcome! This port aims to maintain compatibility with the original while leveraging modern TypeScript/Node.js features.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgements

- Original Python implementation by Joon Sung Park and team
- Game assets by PixyMoon, LimeZu, and ぴぽ
- OpenRouter for unified LLM API access
