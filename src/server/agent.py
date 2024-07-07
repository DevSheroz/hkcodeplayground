import pandas as pd
from pandasai import Agent
from pandasai.llm import AzureOpenAI
from bokeh.embed import json_item
from bokeh.plotting import figure
from dotenv import load_dotenv
import os

load_dotenv('../api/.env') 

class DataAnalysisAgent:
    def __init__(self, df, query: str):
        self.df = pd.DataFrame(df)
        self.query = query
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
        self.agent = Agent(
            self.df,
            config={
                "llm": self.llm,
                "description": "You are a data analysis agent. Your main goal is to help non-technical users to analyze data. If you are asked to plot a chart, use 'bokeh' for charts and embed it using bokeh json_item as return.",
            }
        )


    def handle_query(self, query):
        response = self.agent.chat(query)
        return response
