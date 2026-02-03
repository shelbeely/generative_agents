
# Generative Agents: Interactive Simulacra of Human Behavior 

<p align="center" width="100%">
<img src="cover.png" alt="Smallville" style="width: 80%; min-width: 300px; display: block; margin: auto;">
</p>

This repository accompanies our research paper titled "[Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442)." It contains our core simulation module for generative agents—computational agents that simulate believable human behaviors—and their game environment.

## 🚀 Node.js/TypeScript Port

This is a **complete port** to Node.js/TypeScript with modern enhancements:
- ✅ **TypeScript** for type safety and better developer experience
- ✅ **Per-Agent Models** - Each villager can use a different LLM based on their role
- ✅ **OpenRouter API** supporting 100+ LLM models
- ✅ **Multi-Provider Support** - Use OpenRouter, GitHub Copilot SDK, or OpenClaw
- ✅ **Zero Python dependencies** - Pure TypeScript implementation

**See [README_NODEJS.md](README_NODEJS.md) for complete setup instructions.**

## <img src="https://joonsungpark.s3.amazonaws.com:443/static/assets/characters/profile/Isabella_Rodriguez.png" alt="Generative Isabella"> Quick Start

### Prerequisites
- **Node.js** v20+ or **Bun.js** v1.0+
- **OpenRouter API Key** (get one at [openrouter.ai](https://openrouter.ai))

### Installation

```bash
# Clone repository
git clone https://github.com/shelbeely/generative_agents.git
cd generative_agents

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

### Run the Village Simulation

```bash
# Terminal 1 - Start frontend server
npm run dev:frontend

# Terminal 2 - Start simulation
npm run start
```

Then visit http://localhost:8000/ to see your agents in action!

## 🏘️ Per-Agent Model Selection

Each villager can use a different LLM model suited to their personality:

```typescript
import { Persona } from './src/backend/persona.js';

// Creative writer uses GPT-4 for nuanced storytelling
const isabella = new Persona('Isabella Rodriguez', undefined, 'openai/gpt-4-turbo');

// Technical researcher uses DeepSeek for analytical thinking
const klaus = new Persona('Klaus Mueller', undefined, 'deepseek/deepseek-chat');

// Social coordinator uses Gemini Flash for quick, friendly responses
const maria = new Persona('Maria Lopez', undefined, 'google/gemini-3-flash');
```

Try it: `npm run demo:village`

## <img src="https://joonsungpark.s3.amazonaws.com:443/static/assets/characters/profile/Klaus_Mueller.png" alt="Generative Klaus"> Simulation Features

### Replaying Saved Simulations
With the environment server running, visit: `http://localhost:8000/replay/<simulation-name>/<starting-time-step>`

Example pre-simulated replay (starts at timestep 1):  
[http://localhost:8000/replay/July1_the_ville_isabella_maria_klaus-step-3-20/1/](http://localhost:8000/replay/July1_the_ville_isabella_maria_klaus-step-3-20/1/)

### Demo Mode
For compressed demos with proper character sprites: `http://localhost:8000/demo/<simulation-name>/<starting-time-step>/<speed>`

Example demo (speed 1=slowest, 5=fastest):  
[http://localhost:8000/demo/July1_the_ville_isabella_maria_klaus-step-3-20/1/3/](http://localhost:8000/demo/July1_the_ville_isabella_maria_klaus-step-3-20/1/3/)

### Simulation Storage
- Saved simulations: `environment/frontend_server/storage`
- Compressed demos: `environment/frontend_server/compressed_storage`

## 📚 Original Research

**Paper:** [Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442)

**Authors:** Joon Sung Park, Joseph C. O'Brien, Carrie J. Cai, Meredith Ringel Morris, Percy Liang, Michael S. Bernstein

**Citation:**
```bibtex
@inproceedings{Park2023GenerativeAgents,  
  author = {Park, Joon Sung and O'Brien, Joseph C. and Cai, Carrie J. and Morris, Meredith Ringel Morris and Liang, Percy and Bernstein, Michael S.},  
  title = {Generative Agents: Interactive Simulacra of Human Behavior},  
  year = {2023},  
  publisher = {Association for Computing Machinery},  
  address = {New York, NY, USA},  
  booktitle = {In the 36th Annual ACM Symposium on User Interface Software and Technology (UIST '23)},  
  keywords = {Human-AI interaction, agents, generative AI, large language models},  
  location = {San Francisco, CA, USA},  
  series = {UIST '23}
}
```

## 🎯 Documentation

- **[README_NODEJS.md](README_NODEJS.md)** - Complete setup and usage guide
- **[MODEL_SELECTION_GUIDE.md](MODEL_SELECTION_GUIDE.md)** - How to choose models for agents
- **[MULTI_PROVIDER_GUIDE.md](MULTI_PROVIDER_GUIDE.md)** - Using different LLM backends
- **[PORT_README.md](PORT_README.md)** - Details on the TypeScript port

## 🤝 Contributing

This port maintains the architecture and behavior of the original research while leveraging modern TypeScript/Node.js features.

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgements

**Original Implementation:**
- Original Python implementation by Joon Sung Park and team

**Game Assets:**
- Background art: [PixyMoon (@_PixyMoon\_)](https://twitter.com/_PixyMoon_)
- Furniture/interior design: [LimeZu (@lime_px)](https://twitter.com/lime_px)
- Character design: [ぴぽ (@pipohi)](https://twitter.com/pipohi)

**Additional Thanks:**
- Lindsay Popowski, Philip Guo, Michael Terry, and the Center for Advanced Study in the Behavioral Sciences (CASBS) community
- OpenRouter for unified LLM API access
- All locations in Smallville are inspired by real-world locations that Joon frequented as a student
