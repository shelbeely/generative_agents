# Migration Guide: 2026 Modernization

This document explains the changes made to modernize the Generative Agents codebase for 2026 and how to use the latest features.

## What Changed?

### 1. OpenAI SDK Update (v0.27.0 → v1.54.0+)

The OpenAI Python SDK underwent major changes in v1.0.0. We've updated all code to use the latest patterns.

#### Old Pattern (Deprecated):
```python
import openai
openai.api_key = "your-key"

response = openai.ChatCompletion.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello"}]
)
text = response["choices"][0]["message"]["content"]
```

#### New Pattern (2026):
```python
from openai import OpenAI

client = OpenAI(api_key="your-key")

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "Hello"}]
)
text = response.choices[0].message.content
```

### 2. OpenRouter Integration

OpenRouter provides access to multiple AI providers through a single API. This gives you:

- **Multiple Models**: GPT-4, Claude, Llama, Gemini, and more
- **Better Pricing**: Choose cost-effective alternatives
- **Unified API**: Same interface for all providers

#### Configuration:
```python
# In utils.py
use_openrouter = True
openrouter_api_key = "your-openrouter-key"
openrouter_chat_model = "openai/gpt-3.5-turbo"  # or any model from OpenRouter
openrouter_gpt4_model = "anthropic/claude-3-opus"  # Mix and match providers!
```

#### Available Models (Examples):
- `openai/gpt-3.5-turbo` - Fast and economical
- `openai/gpt-4` - Most capable OpenAI model
- `anthropic/claude-3-opus` - Anthropic's flagship model
- `anthropic/claude-3-sonnet` - Balanced performance
- `meta-llama/llama-3-70b-instruct` - Open-source alternative
- `google/gemini-pro` - Google's Gemini
- See full list at: https://openrouter.ai/models

### 3. Modern Error Handling

The new SDK provides specific exception types for better error handling:

```python
from openai import APIError, APIConnectionError, RateLimitError

try:
    response = client.chat.completions.create(...)
except RateLimitError as e:
    # Handle rate limiting
    print(f"Rate limit hit: {e}")
except APIConnectionError as e:
    # Handle connection issues
    print(f"Connection failed: {e}")
except APIError as e:
    # Handle API errors
    print(f"API error: {e}")
```

### 4. Built-in Retry Logic

The new client includes automatic retry with exponential backoff:

```python
client = OpenAI(
    api_key="your-key",
    timeout=60.0,      # Request timeout in seconds
    max_retries=2,     # Number of automatic retries
)
```

### 5. Updated Dependencies

All major dependencies have been updated:
- **Django**: 2.2 → 4.2 LTS (security updates, better performance)
- **OpenAI**: 0.27.0 → 1.54.0+ (modern API patterns)
- **NumPy**: 1.19.5 → 1.26.0+ (performance improvements)
- **Pandas**: 1.1.5 → 2.2.0+ (better type support)
- And many more...

## How to Migrate

### Step 1: Update Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Update Your utils.py

Choose one of these options:

**Option A - OpenRouter (Recommended):**
```python
use_openrouter = True
openrouter_api_key = "sk-or-v1-..."  # From openrouter.ai
openrouter_chat_model = "openai/gpt-3.5-turbo"
openrouter_gpt4_model = "openai/gpt-4"

# Optional: Only needed if using OpenAI embeddings
openai_api_key = "sk-..."

key_owner = "Your Name"

# ... rest of config (see utils.py.template)
```

**Option B - Direct OpenAI:**
```python
use_openrouter = False
openai_api_key = "sk-..."

key_owner = "Your Name"

# ... rest of config (see utils.py.template)
```

### Step 3: Run the Application

The application works the same way, but now with:
- Better error messages
- Automatic retries
- Access to more models (if using OpenRouter)
- Improved stability

## Backward Compatibility

The changes maintain backward compatibility:
- All existing function names work the same
- Same API for your simulation code
- No changes needed to agent logic
- Configuration is additive (new options, old options still work)

## Benefits of the Update

1. **Reliability**: Built-in retry logic and better error handling
2. **Cost Savings**: Access to cheaper model alternatives via OpenRouter
3. **Performance**: Modern SDK is faster and more efficient
4. **Security**: Updated dependencies patch security vulnerabilities
5. **Future-Proof**: Uses current best practices for 2026

## Troubleshooting

### "Module not found: openai"
Solution: Run `pip install -r requirements.txt`

### "AttributeError: module 'openai' has no attribute 'ChatCompletion'"
Solution: You have old code mixed with new dependencies. Ensure all files are updated.

### Rate Limits
- OpenRouter provides more generous rate limits than direct OpenAI
- Consider using `meta-llama/llama-3-8b-instruct` for development (cheaper)
- Upgrade to GPT-4 or Claude for production runs

### API Key Issues
- OpenRouter keys start with `sk-or-v1-`
- OpenAI keys start with `sk-`
- Make sure you're using the right key for your configuration

## Testing Your Setup

Use the test.py file to verify your configuration:

```bash
cd reverie/backend_server
python test.py
```

This will make a test API call and confirm everything is working.

## Getting Help

1. Check OpenRouter docs: https://openrouter.ai/docs
2. Check OpenAI docs: https://platform.openai.com/docs
3. Review the original paper: https://arxiv.org/abs/2304.03442

## Version Compatibility

- **Python**: 3.9+ (tested on 3.9, 3.10, 3.11)
- **OpenAI SDK**: 1.54.0+
- **Django**: 4.2 LTS
- **OS**: Linux, macOS, Windows

---

**Last Updated**: February 2026
