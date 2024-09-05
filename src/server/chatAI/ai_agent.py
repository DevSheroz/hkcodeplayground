import pandas as pd
from pandasai import Agent, SmartDataframe
from pandasai.llm import AzureOpenAI
import matplotlib.pyplot as plt
from io import StringIO, BytesIO
import base64
import logging
import re
import os
from icecream import ic

class DataAnalysisAgent:
    def __init__(self, df):
        self.data = df

        # Load Azure OpenAI credentials from environment variables
        self.api_key = os.getenv('API_KEY')
        self.azure_endpoint = os.getenv('AZURE_ENDPOINT')
        self.azure_deployment = os.getenv('AZURE_DEPLOYMENT')
        self.openai_api_version = os.getenv('OPENAI_API_VERSION')

        self.llm = AzureOpenAI(
            deployment_name=self.azure_deployment,
            api_version=self.openai_api_version,
            api_token=self.api_key,
            azure_endpoint=self.azure_endpoint,
        )

    
        self.df = Agent(self.data, config={
            "llm": self.llm,
            "description": "You are a data analysis agent. Your main goal is to help non-technical users to analyze data.",
            "verbose": False,
            "open_charts": False,
            "save_charts": False,
            "enable_cache": True,
            
        })


    def handle_query(self, query):

        code = self.df.generate_code(query)
        if code is not None:
            answer = self.df.execute_code(code)
        else:
            answer = self.df.execute_code()
        
        ic(code, answer)
        return code, answer

    def explain_code(self):

        return self.df.explain()



