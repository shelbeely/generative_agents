

# Generative Agents: Interactive Simulacra of Human Behavior 

<p align="center" width="100%">
<img src="cover.png" alt="Smallville" style="width: 80%; min-width: 300px; display: block; margin: auto;">
</p>

This repository accompanies our research paper titled "[Generative Agents: Interactive Simulacra of Human Behavior](https://arxiv.org/abs/2304.03442)." It contains our core simulation module for  generative agents—computational agents that simulate believable human behaviors—and their game environment. Below, we document the steps for setting up the simulation environment on your local machine and for replaying the simulation as a demo animation.

## 🚀 2026 Modernization Update

This codebase has been **modernized for 2026** with the following improvements:

- **✨ OpenRouter Integration**: Now supports [OpenRouter](https://openrouter.ai/) as a backend, giving you access to multiple AI providers (OpenAI, Anthropic, Meta, Google, Mistral, and more) through a single API
- **📦 Updated Dependencies**: All packages updated to their latest stable versions compatible with 2026 standards
- **🔧 Modern API Patterns**: Migrated from deprecated OpenAI SDK (v0.27.0) to the latest OpenAI SDK (v1.54.0+) with proper async support and error handling
- **🌐 Multi-Model Support**: Easily switch between GPT-4, Claude 3, Llama 3, Gemini, and other state-of-the-art models
- **💰 Cost Optimization**: Choose from various models at different price points to optimize costs
- **⚡ Better Performance**: Updated to Django 4.2 LTS and Python 3.9+ for improved stability and performance

**Backward Compatible**: You can still use direct OpenAI access if preferred. See setup instructions below.

## <img src="https://joonsungpark.s3.amazonaws.com:443/static/assets/characters/profile/Isabella_Rodriguez.png" alt="Generative Isabella">   Setting Up the Environment 
To set up your environment, you will need to generate a `utils.py` file that contains your API keys and download the necessary packages.

**Note:** This codebase has been modernized for 2026 and now supports both OpenAI and OpenRouter backends. OpenRouter provides access to multiple AI models through a single API.

### Step 1. Generate Utils File
In the `reverie/backend_server` folder (where `reverie.py` is located), create a new file titled `utils.py` and copy and paste the content below into the file:

#### Option A: Using OpenRouter (Recommended for 2026)
```python
# OpenRouter Configuration (access multiple AI models through one API)
use_openrouter = True
openrouter_api_key = "<Your OpenRouter API Key>"

# Choose your models from OpenRouter's catalog
# openrouter_chat_model: Used for standard/fast operations
# openrouter_gpt4_model: Used for advanced reasoning tasks
#   Note: Despite the name "gpt4", this can be ANY model you want for advanced tasks!
#   Examples: "anthropic/claude-3-opus", "openai/gpt-4", "google/gemini-pro"
openrouter_chat_model = "openai/gpt-3.5-turbo"
openrouter_gpt4_model = "openai/gpt-4"  # Can use Claude, Gemini, or any other model!

# OpenAI key still needed for embeddings (optional if using OpenRouter for embeddings too)
openai_api_key = "<Your OpenAI API Key or leave empty>"

# Put your name
key_owner = "<Name>"

maze_assets_loc = "../../environment/frontend_server/static_dirs/assets"
env_matrix = f"{maze_assets_loc}/the_ville/matrix"
env_visuals = f"{maze_assets_loc}/the_ville/visuals"

fs_storage = "../../environment/frontend_server/storage"
fs_temp_storage = "../../environment/frontend_server/temp_storage"

collision_block_id = "32125"

# Verbose 
debug = True
```

#### Option B: Using OpenAI Directly (Legacy)
```python
# OpenAI Configuration
use_openrouter = False
openai_api_key = "<Your OpenAI API Key>"

# Put your name
key_owner = "<Name>"

maze_assets_loc = "../../environment/frontend_server/static_dirs/assets"
env_matrix = f"{maze_assets_loc}/the_ville/matrix"
env_visuals = f"{maze_assets_loc}/the_ville/visuals"

fs_storage = "../../environment/frontend_server/storage"
fs_temp_storage = "../../environment/frontend_server/temp_storage"

collision_block_id = "32125"

# Verbose 
debug = True
```

**Getting API Keys:**
- **OpenRouter**: Sign up at [openrouter.ai](https://openrouter.ai/) to get your API key. OpenRouter provides access to GPT-4, Claude, Llama, and many other models through a unified API.
- **OpenAI**: Get your API key from [platform.openai.com](https://platform.openai.com/)

Replace the placeholder values with your actual API keys and name.

**💡 Important Note about Model Selection:**
The variable `openrouter_gpt4_model` can be **any model**, not just GPT-4! The name is historical. You can use:
- `"anthropic/claude-3-opus"` for Anthropic's best reasoning
- `"google/gemini-pro"` for Google's Gemini
- `"meta-llama/llama-3-70b-instruct"` for open-source
- Or any model from [OpenRouter's catalog](https://openrouter.ai/models)

The "gpt4" in the variable name just refers to "advanced reasoning model", not specifically GPT-4!

**📖 Migration Guide**: If you're upgrading from the old version (pre-2026), see [MIGRATION.md](MIGRATION.md) for detailed migration instructions and troubleshooting.
 
### Step 2. Install requirements.txt
Install everything listed in the `requirements.txt` file (I strongly recommend first setting up a virtualenv as usual). 

**Python Version**: This modernized version requires **Python 3.9+**. We've tested on Python 3.9, 3.10, and 3.11. Python 3.8 and below are not supported due to dependency requirements.

```bash
# Create a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3. Validate Your Setup (Recommended)

Before running the simulation, validate that everything is configured correctly:

```bash
cd reverie/backend_server
python validate_setup.py
```

This script will check:
- ✓ Python version compatibility
- ✓ Required dependencies are installed
- ✓ utils.py is properly configured
- ✓ API connection is working

If all checks pass, you're ready to run the simulation!

## <img src="https://joonsungpark.s3.amazonaws.com:443/static/assets/characters/profile/Klaus_Mueller.png" alt="Generative Klaus">   Running a Simulation 
To run a new simulation, you will need to concurrently start two servers: the environment server and the agent simulation server.

### Step 1. Starting the Environment Server
Again, the environment is implemented as a Django project, and as such, you will need to start the Django server. To do this, first navigate to `environment/frontend_server` (this is where `manage.py` is located) in your command line. Then run the following command:

    python manage.py runserver

Then, on your favorite browser, go to [http://localhost:8000/](http://localhost:8000/). If you see a message that says, "Your environment server is up and running," your server is running properly. Ensure that the environment server continues to run while you are running the simulation, so keep this command-line tab open! (Note: I recommend using either Chrome or Safari. Firefox might produce some frontend glitches, although it should not interfere with the actual simulation.)

### Step 2. Starting the Simulation Server
Open up another command line (the one you used in Step 1 should still be running the environment server, so leave that as it is). Navigate to `reverie/backend_server` and run `reverie.py`.

    python reverie.py
This will start the simulation server. A command-line prompt will appear, asking the following: "Enter the name of the forked simulation: ". To start a 3-agent simulation with Isabella Rodriguez, Maria Lopez, and Klaus Mueller, type the following:
    
    base_the_ville_isabella_maria_klaus
The prompt will then ask, "Enter the name of the new simulation: ". Type any name to denote your current simulation (e.g., just "test-simulation" will do for now).

    test-simulation
Keep the simulator server running. At this stage, it will display the following prompt: "Enter option: "

### Step 3. Running and Saving the Simulation
On your browser, navigate to [http://localhost:8000/simulator_home](http://localhost:8000/simulator_home). You should see the map of Smallville, along with a list of active agents on the map. You can move around the map using your keyboard arrows. Please keep this tab open. To run the simulation, type the following command in your simulation server in response to the prompt, "Enter option":

    run <step-count>
Note that you will want to replace `<step-count>` above with an integer indicating the number of game steps you want to simulate. For instance, if you want to simulate 100 game steps, you should input `run 100`. One game step represents 10 seconds in the game.


Your simulation should be running, and you will see the agents moving on the map in your browser. Once the simulation finishes running, the "Enter option" prompt will re-appear. At this point, you can simulate more steps by re-entering the run command with your desired game steps, exit the simulation without saving by typing `exit`, or save and exit by typing `fin`.

The saved simulation can be accessed the next time you run the simulation server by providing the name of your simulation as the forked simulation. This will allow you to restart your simulation from the point where you left off.

### Step 4. Replaying a Simulation
You can replay a simulation that you have already run simply by having your environment server running and navigating to the following address in your browser: `http://localhost:8000/replay/<simulation-name>/<starting-time-step>`. Please make sure to replace `<simulation-name>` with the name of the simulation you want to replay, and `<starting-time-step>` with the integer time-step from which you wish to start the replay.

For instance, by visiting the following link, you will initiate a pre-simulated example, starting at time-step 1:  
[http://localhost:8000/replay/July1_the_ville_isabella_maria_klaus-step-3-20/1/](http://localhost:8000/replay/July1_the_ville_isabella_maria_klaus-step-3-20/1/)

### Step 5. Demoing a Simulation
You may have noticed that all character sprites in the replay look identical. We would like to clarify that the replay function is primarily intended for debugging purposes and does not prioritize optimizing the size of the simulation folder or the visuals. To properly demonstrate a simulation with appropriate character sprites, you will need to compress the simulation first. To do this, open the `compress_sim_storage.py` file located in the `reverie` directory using a text editor. Then, execute the `compress` function with the name of the target simulation as its input. By doing so, the simulation file will be compressed, making it ready for demonstration.

To start the demo, go to the following address on your browser: `http://localhost:8000/demo/<simulation-name>/<starting-time-step>/<simulation-speed>`. Note that `<simulation-name>` and `<starting-time-step>` denote the same things as mentioned above. `<simulation-speed>` can be set to control the demo speed, where 1 is the slowest, and 5 is the fastest. For instance, visiting the following link will start a pre-simulated example, beginning at time-step 1, with a medium demo speed:  
[http://localhost:8000/demo/July1_the_ville_isabella_maria_klaus-step-3-20/1/3/](http://localhost:8000/demo/July1_the_ville_isabella_maria_klaus-step-3-20/1/3/)

### Tips
**2026 Update:** This codebase has been modernized with the latest API patterns and support for OpenRouter, which provides access to multiple AI providers (OpenAI, Anthropic, Meta, Google, etc.) through a single API. This gives you:
- **More model choices**: Access GPT-4, Claude, Llama, Gemini, and more
- **Better reliability**: Automatic fallback between providers
- **Cost optimization**: Compare prices and choose the most cost-effective models

**General Tips:**
- Save your simulation frequently to avoid losing progress if API limits are reached
- OpenRouter provides generous rate limits and supports many models, reducing the chance of interruptions
- Consider using cheaper models like `openai/gpt-3.5-turbo` or `meta-llama/llama-3-8b-instruct` for development, and upgrade to `openai/gpt-4` or `anthropic/claude-3-opus` for production runs
- Monitor your API usage through your provider's dashboard

## <img src="https://joonsungpark.s3.amazonaws.com:443/static/assets/characters/profile/Maria_Lopez.png" alt="Generative Maria">   Simulation Storage Location
All simulations that you save will be located in `environment/frontend_server/storage`, and all compressed demos will be located in `environment/frontend_server/compressed_storage`. 

## <img src="https://joonsungpark.s3.amazonaws.com:443/static/assets/characters/profile/Sam_Moore.png" alt="Generative Sam">   Customization

There are two ways to optionally customize your simulations. 

### Author and Load Agent History
First is to initialize agents with unique history at the start of the simulation. To do this, you would want to 1) start your simulation using one of the base simulations, and 2) author and load agent history. More specifically, here are the steps:

#### Step 1. Starting Up a Base Simulation 
There are two base simulations included in the repository: `base_the_ville_n25` with 25 agents, and `base_the_ville_isabella_maria_klaus` with 3 agents. Load one of the base simulations by following the steps until step 2 above. 

#### Step 2. Loading a History File 
Then, when prompted with "Enter option: ", you should load the agent history by responding with the following command:

    call -- load history the_ville/<history_file_name>.csv
Note that you will need to replace `<history_file_name>` with the name of an existing history file. There are two history files included in the repo as examples: `agent_history_init_n25.csv` for `base_the_ville_n25` and `agent_history_init_n3.csv` for `base_the_ville_isabella_maria_klaus`. These files include semicolon-separated lists of memory records for each of the agents—loading them will insert the memory records into the agents' memory stream.

#### Step 3. Further Customization 
To customize the initialization by authoring your own history file, place your file in the following folder: `environment/frontend_server/static_dirs/assets/the_ville`. The column format for your custom history file will have to match the example history files included. Therefore, we recommend starting the process by copying and pasting the ones that are already in the repository.

### Create New Base Simulations
For a more involved customization, you will need to author your own base simulation files. The most straightforward approach would be to copy and paste an existing base simulation folder, renaming and editing it according to your requirements. This process will be simpler if you decide to keep the agent names unchanged. However, if you wish to change their names or increase the number of agents that the Smallville map can accommodate, you might need to directly edit the map using the [Tiled](https://www.mapeditor.org/) map editor.


## <img src="https://joonsungpark.s3.amazonaws.com:443/static/assets/characters/profile/Eddy_Lin.png" alt="Generative Eddy">   Authors and Citation 

**Authors:** Joon Sung Park, Joseph C. O'Brien, Carrie J. Cai, Meredith Ringel Morris, Percy Liang, Michael S. Bernstein

Please cite our paper if you use the code or data in this repository. 
```
@inproceedings{Park2023GenerativeAgents,  
author = {Park, Joon Sung and O'Brien, Joseph C. and Cai, Carrie J. and Morris, Meredith Ringel and Liang, Percy and Bernstein, Michael S.},  
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

## <img src="https://joonsungpark.s3.amazonaws.com:443/static/assets/characters/profile/Wolfgang_Schulz.png" alt="Generative Wolfgang">   Acknowledgements

We encourage you to support the following three amazing artists who have designed the game assets for this project, especially if you are planning to use the assets included here for your own project: 
* Background art: [PixyMoon (@_PixyMoon\_)](https://twitter.com/_PixyMoon_)
* Furniture/interior design: [LimeZu (@lime_px)](https://twitter.com/lime_px)
* Character design: [ぴぽ (@pipohi)](https://twitter.com/pipohi)

In addition, we thank Lindsay Popowski, Philip Guo, Michael Terry, and the Center for Advanced Study in the Behavioral Sciences (CASBS) community for their insights, discussions, and support. Lastly, all locations featured in Smallville are inspired by real-world locations that Joon has frequented as an undergraduate and graduate student---he thanks everyone there for feeding and supporting him all these years.


