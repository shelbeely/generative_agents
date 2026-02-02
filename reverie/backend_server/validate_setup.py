#!/usr/bin/env python3
"""
Validation script for testing the 2026 modernization setup.
This script verifies that your configuration is correct and the API is working.

Usage:
    cd reverie/backend_server
    python validate_setup.py
"""

import sys
import os

def check_python_version():
    """Check if Python version is 3.9 or higher."""
    print("Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print(f"❌ ERROR: Python {version.major}.{version.minor} detected. Python 3.9+ is required.")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro} - OK")
    return True

def check_dependencies():
    """Check if required packages are installed."""
    print("\nChecking dependencies...")
    required = {
        'openai': '1.54.0',
        'django': '4.2.0',
    }
    
    all_ok = True
    for package, min_version in required.items():
        try:
            if package == 'openai':
                import openai
                version = openai.__version__
            elif package == 'django':
                import django
                version = django.__version__
            
            # Simple version comparison
            installed = tuple(map(int, version.split('.')[:2]))
            required_ver = tuple(map(int, min_version.split('.')[:2]))
            
            if installed >= required_ver:
                print(f"✓ {package} {version} - OK")
            else:
                print(f"⚠ {package} {version} installed, but {min_version}+ recommended")
        except ImportError:
            print(f"❌ {package} is not installed")
            all_ok = False
        except Exception as e:
            print(f"⚠ Could not verify {package}: {e}")
    
    return all_ok

def check_utils_file():
    """Check if utils.py exists and is configured."""
    print("\nChecking utils.py configuration...")
    try:
        import utils
        
        # Check required fields
        required_fields = ['key_owner', 'maze_assets_loc', 'debug']
        missing = [f for f in required_fields if not hasattr(utils, f)]
        
        if missing:
            print(f"❌ Missing required fields in utils.py: {', '.join(missing)}")
            return False
        
        # Check API configuration
        if hasattr(utils, 'use_openrouter') and utils.use_openrouter:
            if not hasattr(utils, 'openrouter_api_key') or utils.openrouter_api_key.startswith('<'):
                print("❌ OpenRouter is enabled but openrouter_api_key is not set")
                return False
            print("✓ OpenRouter configuration detected")
            print(f"  - Chat model: {getattr(utils, 'openrouter_chat_model', 'default')}")
            print(f"  - GPT-4 model: {getattr(utils, 'openrouter_gpt4_model', 'default')}")
        else:
            if not hasattr(utils, 'openai_api_key') or utils.openai_api_key.startswith('<'):
                print("❌ OpenAI API key is not set")
                return False
            print("✓ OpenAI configuration detected")
        
        print(f"✓ Key owner: {utils.key_owner}")
        print(f"✓ Debug mode: {utils.debug}")
        return True
        
    except ImportError:
        print("❌ utils.py not found!")
        print("   Please create utils.py from utils.py.template")
        return False
    except Exception as e:
        print(f"❌ Error reading utils.py: {e}")
        return False

def test_api_call():
    """Test a simple API call."""
    print("\nTesting API connection...")
    try:
        from openai import OpenAI, APIError
        from utils import *
        
        # Initialize client
        if use_openrouter:
            client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=openrouter_api_key,
                timeout=30.0,
                max_retries=1,
            )
            try:
                model = openrouter_chat_model
            except NameError:
                model = "openai/gpt-3.5-turbo"
            print(f"  Using OpenRouter with model: {model}")
        else:
            client = OpenAI(
                api_key=openai_api_key,
                timeout=30.0,
                max_retries=1,
            )
            model = "gpt-3.5-turbo"
            print(f"  Using OpenAI with model: {model}")
        
        # Make a simple test call
        print("  Making test API call...")
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say 'Hello from 2026!' and nothing else."}],
            max_tokens=20
        )
        
        result = response.choices[0].message.content
        print(f"✓ API call successful!")
        print(f"  Response: {result}")
        return True
        
    except APIError as e:
        print(f"❌ API Error: {e}")
        print("   Check your API key and quota")
        return False
    except Exception as e:
        print(f"❌ Error during API call: {e}")
        return False

def main():
    """Run all validation checks."""
    print("=" * 60)
    print("Generative Agents - 2026 Setup Validation")
    print("=" * 60)
    
    results = []
    
    # Run checks
    results.append(("Python Version", check_python_version()))
    results.append(("Dependencies", check_dependencies()))
    results.append(("Configuration", check_utils_file()))
    
    # Only test API if previous checks passed
    if all(r[1] for r in results):
        results.append(("API Connection", test_api_call()))
    else:
        print("\n⚠ Skipping API test due to previous failures")
        results.append(("API Connection", None))
    
    # Summary
    print("\n" + "=" * 60)
    print("VALIDATION SUMMARY")
    print("=" * 60)
    for name, result in results:
        if result is True:
            status = "✓ PASS"
        elif result is False:
            status = "✗ FAIL"
        else:
            status = "- SKIP"
        print(f"{status:8} {name}")
    
    print("=" * 60)
    
    if all(r[1] for r in results):
        print("\n🎉 All checks passed! Your setup is ready to use.")
        print("\nNext steps:")
        print("  1. Navigate to environment/frontend_server")
        print("  2. Run: python manage.py runserver")
        print("  3. In another terminal, navigate to reverie/backend_server")
        print("  4. Run: python reverie.py")
        return 0
    else:
        print("\n⚠ Some checks failed. Please fix the issues above.")
        print("\nFor help, see:")
        print("  - README.md for setup instructions")
        print("  - MIGRATION.md for migration guide")
        print("  - utils.py.template for configuration example")
        return 1

if __name__ == "__main__":
    sys.exit(main())
