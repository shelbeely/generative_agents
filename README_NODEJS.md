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

### 1. Install Bun (if not already installed)

```bash
# On macOS/Linux
curl -fsSL https://bun.sh/install | bash

# On Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/shelbeely/generative_agents.git
cd generative_agents
bun install
```

### 3. Configure Environment

Copy the example environment file and add your OpenRouter API key:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:

```env
# Required: Your OpenRouter API key
OPENROUTER_API_KEY=your_api_key_here

# Optional: Choose your preferred models
DEFAULT_MODEL=openai/gpt-3.5-turbo
ADVANCED_MODEL=openai/gpt-4

# Optional: Your name
KEY_OWNER=Your Name
```

### 4. Start the Servers

You'll need to run two servers concurrently:

**Terminal 1 - Frontend Server:**
```bash
bun run dev:frontend
```

**Terminal 2 - Backend Simulation Server:**
```bash
bun run dev
```

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

- `openai/gpt-4` - Most capable, slower
- `openai/gpt-3.5-turbo` - Fast and cost-effective
- `anthropic/claude-3-sonnet` - Anthropic's Claude
- `google/gemini-pro` - Google's Gemini
- `meta-llama/llama-3-70b` - Open source Llama

Configure these in your `.env` file.

## 💡 Tips

- Simulations can be expensive - save often!
- Use `gpt-3.5-turbo` for development/testing
- Upgrade to `gpt-4` for better agent behaviors
- OpenRouter provides unified billing across all providers

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
