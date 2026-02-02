"""
Author: Joon Sung Park (joonspk@stanford.edu)

File: gpt_structure.py
Description: Wrapper functions for calling OpenAI APIs and OpenRouter.
Modernized for 2026 with support for OpenRouter backend.
Uses the latest OpenAI Python SDK (v1.54.0+) patterns.
"""
import json
import random
import time
from openai import OpenAI, APIError, APIConnectionError, RateLimitError

from utils import *

# Initialize the OpenAI client based on configuration
# Supports both direct OpenAI and OpenRouter backends
# The new OpenAI SDK uses a client-based approach (as of v1.0.0+)
if use_openrouter:
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=openrouter_api_key,
        timeout=60.0,  # 60 second timeout
        max_retries=2,  # Built-in retry logic
    )
    # Default models for OpenRouter - check if custom models are defined
    try:
        default_chat_model = openrouter_chat_model
    except NameError:
        default_chat_model = "openai/gpt-3.5-turbo"
    
    try:
        default_gpt4_model = openrouter_gpt4_model
    except NameError:
        default_gpt4_model = "openai/gpt-4"
else:
    client = OpenAI(
        api_key=openai_api_key,
        timeout=60.0,  # 60 second timeout
        max_retries=2,  # Built-in retry logic
    )
    # Default models for OpenAI (using latest model names)
    default_chat_model = "gpt-3.5-turbo"
    default_gpt4_model = "gpt-4"

def temp_sleep(seconds=0.1):
  time.sleep(seconds)

def ChatGPT_single_request(prompt): 
  temp_sleep()

  completion = client.chat.completions.create(
    model=default_chat_model, 
    messages=[{"role": "user", "content": prompt}]
  )
  return completion.choices[0].message.content


# ============================================================================
# #####################[SECTION 1: CHATGPT-3 STRUCTURE] ######################
# ============================================================================

def GPT4_request(prompt): 
  """
  Given a prompt and a dictionary of GPT parameters, make a request to OpenAI
  server and returns the response. 
  Uses the latest OpenAI SDK (v1.0+) with proper error handling.
  ARGS:
    prompt: a str prompt
  RETURNS: 
    a str of GPT-4's response. 
  """
  temp_sleep()

  try: 
    completion = client.chat.completions.create(
      model=default_gpt4_model, 
      messages=[{"role": "user", "content": prompt}]
    )
    return completion.choices[0].message.content
  
  except RateLimitError as e:
    print(f"Rate limit error: {e}")
    return "ChatGPT ERROR"
  except APIConnectionError as e:
    print(f"Connection error: {e}")
    return "ChatGPT ERROR"
  except APIError as e:
    print(f"API error: {e}")
    return "ChatGPT ERROR"
  except Exception as e: 
    print(f"Unexpected error: {e}")
    return "ChatGPT ERROR"


def ChatGPT_request(prompt): 
  """
  Given a prompt and a dictionary of GPT parameters, make a request to OpenAI
  server and returns the response. 
  Uses the latest OpenAI SDK (v1.0+) with proper error handling.
  ARGS:
    prompt: a str prompt
  RETURNS: 
    a str of GPT-3.5's response. 
  """
  # temp_sleep()
  try: 
    completion = client.chat.completions.create(
      model=default_chat_model, 
      messages=[{"role": "user", "content": prompt}]
    )
    return completion.choices[0].message.content
  
  except RateLimitError as e:
    print(f"Rate limit error: {e}")
    return "ChatGPT ERROR"
  except APIConnectionError as e:
    print(f"Connection error: {e}")
    return "ChatGPT ERROR"
  except APIError as e:
    print(f"API error: {e}")
    return "ChatGPT ERROR"
  except Exception as e: 
    print(f"Unexpected error: {e}")
    return "ChatGPT ERROR"


def GPT4_safe_generate_response(prompt, 
                                   example_output,
                                   special_instruction,
                                   repeat=3,
                                   fail_safe_response="error",
                                   func_validate=None,
                                   func_clean_up=None,
                                   verbose=False): 
  prompt = 'GPT-3 Prompt:\n"""\n' + prompt + '\n"""\n'
  prompt += f"Output the response to the prompt above in json. {special_instruction}\n"
  prompt += "Example output json:\n"
  prompt += '{"output": "' + str(example_output) + '"}'

  if verbose: 
    print ("CHAT GPT PROMPT")
    print (prompt)

  for i in range(repeat): 

    try: 
      curr_gpt_response = GPT4_request(prompt).strip()
      end_index = curr_gpt_response.rfind('}') + 1
      curr_gpt_response = curr_gpt_response[:end_index]
      curr_gpt_response = json.loads(curr_gpt_response)["output"]
      
      if func_validate(curr_gpt_response, prompt=prompt): 
        return func_clean_up(curr_gpt_response, prompt=prompt)
      
      if verbose: 
        print ("---- repeat count: \n", i, curr_gpt_response)
        print (curr_gpt_response)
        print ("~~~~")

    except: 
      pass

  return False


def ChatGPT_safe_generate_response(prompt, 
                                   example_output,
                                   special_instruction,
                                   repeat=3,
                                   fail_safe_response="error",
                                   func_validate=None,
                                   func_clean_up=None,
                                   verbose=False): 
  # prompt = 'GPT-3 Prompt:\n"""\n' + prompt + '\n"""\n'
  prompt = '"""\n' + prompt + '\n"""\n'
  prompt += f"Output the response to the prompt above in json. {special_instruction}\n"
  prompt += "Example output json:\n"
  prompt += '{"output": "' + str(example_output) + '"}'

  if verbose: 
    print ("CHAT GPT PROMPT")
    print (prompt)

  for i in range(repeat): 

    try: 
      curr_gpt_response = ChatGPT_request(prompt).strip()
      end_index = curr_gpt_response.rfind('}') + 1
      curr_gpt_response = curr_gpt_response[:end_index]
      curr_gpt_response = json.loads(curr_gpt_response)["output"]

      # print ("---ashdfaf")
      # print (curr_gpt_response)
      # print ("000asdfhia")
      
      if func_validate(curr_gpt_response, prompt=prompt): 
        return func_clean_up(curr_gpt_response, prompt=prompt)
      
      if verbose: 
        print ("---- repeat count: \n", i, curr_gpt_response)
        print (curr_gpt_response)
        print ("~~~~")

    except: 
      pass

  return False


def ChatGPT_safe_generate_response_OLD(prompt, 
                                   repeat=3,
                                   fail_safe_response="error",
                                   func_validate=None,
                                   func_clean_up=None,
                                   verbose=False): 
  if verbose: 
    print ("CHAT GPT PROMPT")
    print (prompt)

  for i in range(repeat): 
    try: 
      curr_gpt_response = ChatGPT_request(prompt).strip()
      if func_validate(curr_gpt_response, prompt=prompt): 
        return func_clean_up(curr_gpt_response, prompt=prompt)
      if verbose: 
        print (f"---- repeat count: {i}")
        print (curr_gpt_response)
        print ("~~~~")

    except: 
      pass
  print ("FAIL SAFE TRIGGERED") 
  return fail_safe_response


# ============================================================================
# ###################[SECTION 2: ORIGINAL GPT-3 STRUCTURE] ###################
# ============================================================================

def GPT_request(prompt, gpt_parameter): 
  """
  Given a prompt and a dictionary of GPT parameters, make a request to OpenAI
  server and returns the response. 
  ARGS:
    prompt: a str prompt
    gpt_parameter: a python dictionary with the keys indicating the names of  
                   the parameter and the values indicating the parameter 
                   values.   
  RETURNS: 
    a str of GPT-3's response. 
  """
  temp_sleep()
  try: 
    # Note: Legacy completion endpoint is deprecated, converting to chat format
    # For backward compatibility with old GPT-3 parameters
    # Map old model names to modern equivalents
    engine = gpt_parameter.get("engine", "gpt-3.5-turbo")
    model_mapping = {
        "text-davinci-003": "gpt-3.5-turbo",
        "text-davinci-002": "gpt-3.5-turbo",
        "text-curie-001": "gpt-3.5-turbo",
        "text-babbage-001": "gpt-3.5-turbo",
        "text-ada-001": "gpt-3.5-turbo",
    }
    model = model_mapping.get(engine, engine)
    
    response = client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": prompt}],
                temperature=gpt_parameter.get("temperature", 0.7),
                max_tokens=gpt_parameter.get("max_tokens", 150),
                top_p=gpt_parameter.get("top_p", 1),
                frequency_penalty=gpt_parameter.get("frequency_penalty", 0),
                presence_penalty=gpt_parameter.get("presence_penalty", 0),
                stop=gpt_parameter.get("stop", None))
    return response.choices[0].message.content
  except Exception as e: 
    print (f"TOKEN LIMIT EXCEEDED OR ERROR: {e}")
    return "TOKEN LIMIT EXCEEDED"


def generate_prompt(curr_input, prompt_lib_file): 
  """
  Takes in the current input (e.g. comment that you want to classifiy) and 
  the path to a prompt file. The prompt file contains the raw str prompt that
  will be used, which contains the following substr: !<INPUT>! -- this 
  function replaces this substr with the actual curr_input to produce the 
  final promopt that will be sent to the GPT3 server. 
  ARGS:
    curr_input: the input we want to feed in (IF THERE ARE MORE THAN ONE
                INPUT, THIS CAN BE A LIST.)
    prompt_lib_file: the path to the promopt file. 
  RETURNS: 
    a str prompt that will be sent to OpenAI's GPT server.  
  """
  if type(curr_input) == type("string"): 
    curr_input = [curr_input]
  curr_input = [str(i) for i in curr_input]

  f = open(prompt_lib_file, "r")
  prompt = f.read()
  f.close()
  for count, i in enumerate(curr_input):   
    prompt = prompt.replace(f"!<INPUT {count}>!", i)
  if "<commentblockmarker>###</commentblockmarker>" in prompt: 
    prompt = prompt.split("<commentblockmarker>###</commentblockmarker>")[1]
  return prompt.strip()


def safe_generate_response(prompt, 
                           gpt_parameter,
                           repeat=5,
                           fail_safe_response="error",
                           func_validate=None,
                           func_clean_up=None,
                           verbose=False): 
  if verbose: 
    print (prompt)

  for i in range(repeat): 
    curr_gpt_response = GPT_request(prompt, gpt_parameter)
    if func_validate(curr_gpt_response, prompt=prompt): 
      return func_clean_up(curr_gpt_response, prompt=prompt)
    if verbose: 
      print ("---- repeat count: ", i, curr_gpt_response)
      print (curr_gpt_response)
      print ("~~~~")
  return fail_safe_response


def get_embedding(text, model="text-embedding-ada-002"):
  text = text.replace("\n", " ")
  if not text: 
    text = "this is blank"
  response = client.embeddings.create(
          input=[text], model=model)
  return response.data[0].embedding


if __name__ == '__main__':
  gpt_parameter = {"engine": "text-davinci-003", "max_tokens": 50, 
                   "temperature": 0, "top_p": 1, "stream": False,
                   "frequency_penalty": 0, "presence_penalty": 0, 
                   "stop": ['"']}
  curr_input = ["driving to a friend's house"]
  prompt_lib_file = "prompt_template/test_prompt_July5.txt"
  prompt = generate_prompt(curr_input, prompt_lib_file)

  def __func_validate(gpt_response): 
    if len(gpt_response.strip()) <= 1:
      return False
    if len(gpt_response.strip().split(" ")) > 1: 
      return False
    return True
  def __func_clean_up(gpt_response):
    cleaned_response = gpt_response.strip()
    return cleaned_response

  output = safe_generate_response(prompt, 
                                 gpt_parameter,
                                 5,
                                 "rest",
                                 __func_validate,
                                 __func_clean_up,
                                 True)

  print (output)




















