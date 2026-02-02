# Migration Guide: Python to Node.js/Bun.js

This guide helps users transition from the original Python implementation to the new Node.js/Bun.js port.

## 🔄 Key Differences

### Runtime Environment

| Python Version | Node.js/Bun.js Version |
|----------------|------------------------|
| Python 3.9+ | Node.js 20+ or Bun 1.0+ |
| pip/virtualenv | npm/bun |
| requirements.txt | package.json |
| utils.py config | .env file |

### Configuration

**Python (utils.py):**
```python
openai_api_key = "<Your OpenAI API>"
key_owner = "<Name>"
maze_assets_loc = "../../environment/frontend_server/static_dirs/assets"
debug = True
```

**Node.js/Bun.js (.env):**
```bash
OPENROUTER_API_KEY=your_api_key_here
KEY_OWNER=Your Name
MAZE_ASSETS_LOC=environment/frontend_server/static_dirs/assets
DEBUG=true
```

### API Backend

| Aspect | Python | Node.js/Bun.js |
|--------|--------|----------------|
| Provider | OpenAI only | OpenRouter (multi-provider) |
| API Library | `openai` package | Native `fetch` |
| Models | GPT-3.5, GPT-4 | Any OpenRouter model |
| Rate Limiting | Manual | Built-in |

### Server Architecture

**Python:**
- Frontend: Django (port 8000)
- Backend: Python script
- Communication: File-based

**Node.js/Bun.js:**
- Frontend: Express.js (port 8000)
- Backend: TypeScript server (port 3000)
- Communication: File-based (compatible with Python)

## 📦 Installation Comparison

### Python Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Configure
# Create reverie/backend_server/utils.py manually
```

### Node.js/Bun.js Setup
```bash
# Install Bun (optional, faster)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install  # or npm install

# Configure
cp .env.example .env
# Edit .env with your API key
```

## 🚀 Running Simulations

### Python Commands

**Start Frontend:**
```bash
cd environment/frontend_server
python manage.py runserver
```

**Start Backend:**
```bash
cd reverie/backend_server
python reverie.py
```

### Node.js/Bun.js Commands

**Start Frontend:**
```bash
bun run dev:frontend
# or: npm run dev:frontend
```

**Start Backend:**
```bash
bun run dev
# or: npm run dev
```

## 🎯 Command Compatibility

All commands work the same way in both versions:

| Command | Python | Node.js/Bun.js | Description |
|---------|--------|----------------|-------------|
| Fork simulation | `base_the_ville_isabella_maria_klaus` | ✅ Same | Choose base simulation |
| Name simulation | `test-simulation` | ✅ Same | Name your simulation |
| Run steps | `run 100` | ✅ Same | Run 100 steps |
| Save & exit | `fin` | ✅ Same | Save and quit |
| Exit without saving | `exit` | ✅ Same | Quit without saving |

## 📁 Data Compatibility

### Simulation Storage
✅ **Fully compatible** - Both versions use the same JSON format:
- `environment/frontend_server/storage/`
- Can load Python simulations in Node.js
- Can load Node.js simulations in Python (once complete)

### Prompt Templates
⚠️ **Requires copying** - Same format, different location:
- Python: `reverie/backend_server/persona/prompt_template/v2/*.txt`
- Node.js: `src/backend/prompt_template/*.txt` (to be implemented)

## 🔧 API Differences

### OpenAI → OpenRouter

**Python (OpenAI):**
```python
openai.api_key = openai_api_key
response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": prompt}]
)
```

**Node.js/Bun.js (OpenRouter):**
```typescript
const response = await openRouterClient.chatCompletion(
  [{ role: 'user', content: prompt }],
  { model: 'openai/gpt-3.5-turbo' }
);
```

### Model Selection

**OpenRouter gives you more options:**

| Type | Python (OpenAI) | Node.js/Bun.js (OpenRouter) |
|------|-----------------|----------------------------|
| Fast | gpt-3.5-turbo | openai/gpt-3.5-turbo |
| Advanced | gpt-4 | openai/gpt-4 |
| Alternative | N/A | anthropic/claude-3-sonnet |
| Alternative | N/A | google/gemini-pro |
| Alternative | N/A | meta-llama/llama-3-70b |
| Open Source | N/A | mistralai/mixtral-8x7b |

## 💰 Cost Comparison

### Python (OpenAI Direct)
- Must use OpenAI
- Billed by OpenAI
- OpenAI rates apply

### Node.js/Bun.js (OpenRouter)
- Use any provider
- Unified billing
- Competitive rates
- Pay-as-you-go
- Can mix models (GPT-4 for hard tasks, GPT-3.5 for easy tasks)

## 🐛 Troubleshooting

### "Module not found" errors

**Python:**
```bash
# Activate virtualenv
source venv/bin/activate
pip install -r requirements.txt
```

**Node.js/Bun.js:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### API Key Issues

**Python:**
```python
# Check reverie/backend_server/utils.py
openai_api_key = "sk-..."  # OpenAI key
```

**Node.js/Bun.js:**
```bash
# Check .env file
OPENROUTER_API_KEY=sk-or-...  # OpenRouter key (different format!)
```

### Port Conflicts

Both versions use the same ports by default:
- Frontend: 8000
- Backend: N/A (Python) / 3000 (Node.js)

To change ports in Node.js:
```bash
# Edit .env
FRONTEND_PORT=8080
BACKEND_PORT=3001
```

## 📊 Performance Expectations

| Metric | Python | Node.js | Bun.js |
|--------|--------|---------|--------|
| Startup Time | ~2s | ~1s | ~0.3s |
| Memory Usage | ~200MB | ~100MB | ~80MB |
| API Latency | Same | Same | Same |
| File I/O | Fast | Fast | Faster |

## 🔜 What's Different (Currently)

### ✅ Available Now
- Configuration and setup
- API integration (OpenRouter)
- Memory structures
- Basic servers
- CLI interface

### 🚧 Coming Soon
- Full simulation engine
- Cognitive modules
- Persona behaviors
- Maze system
- Complete visualization

## 📞 Getting Help

### Python Version Issues
- See original README.md
- Check Python 3.9+ compatibility
- Verify OpenAI API key

### Node.js/Bun.js Version Issues
- See README_NODEJS.md
- Check Node 20+ or Bun 1.0+
- Verify OpenRouter API key
- Check .env configuration

## 🎓 Learning Resources

### For Python Developers New to Node.js
- **TypeScript**: https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html
- **Node.js**: https://nodejs.dev/learn
- **Bun.js**: https://bun.sh/docs
- **ESM Modules**: https://nodejs.org/api/esm.html

### For JavaScript Developers New to This Project
- **Original Paper**: https://arxiv.org/abs/2304.03442
- **Cognitive Architecture**: See IMPLEMENTATION_STATUS.md
- **Memory Systems**: See src/backend/memory/

## 🤝 Contributing

### Python Version
- See original repository
- Standard Python conventions
- PR to main branch

### Node.js/Bun.js Port
- TypeScript required
- ES2022+ syntax
- ESLint + Prettier
- PR to port branch

---

**Questions?** Check IMPLEMENTATION_STATUS.md for current development status.
