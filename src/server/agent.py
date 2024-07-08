import pandas as pd
from pandasai import Agent
from pandasai.llm import AzureOpenAI
import matplotlib.pyplot as plt

from dotenv import load_dotenv
import os
import re
from io import StringIO, BytesIO
import base64
import logging

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
                "description": "You are a data analysis agent. Your main goal is to help non-technical users to analyze data.",
                "verbose": True,
            }
        )

    def handle_query(self, query):
        logger = logging.getLogger('pandasai.helpers.logger')
        logger.setLevel(logging.INFO)

        log_stream = StringIO()
        log_handler = logging.StreamHandler(log_stream)
        logger.addHandler(log_handler)
        
        response = self.agent.chat(query)

        # Process the log content
        log_handler.flush()
        log_content = log_stream.getvalue()
        match = re.search(r"Answer: (.+)", log_content)
        if match:
            raw_result = match.group(1)
            type_match = re.search(r"'type': '(\w+)'", raw_result)
            if type_match:
                result_type = type_match.group(1)
                if result_type == 'plot':

                    img = BytesIO()
                    plt.savefig(img, format='png')
                    img.seek(0)
                    plot_url = base64.b64encode(img.getvalue()).decode('utf8')
                    plt.close()

                    return {"type": result_type, "value": f"data:image/png;base64,{plot_url}"}
                
                elif result_type == 'dataframe':
                    dataframe_json = self.df.to_json(orient="records")
                    print(dataframe_json)
                    return {"type": result_type, "value": dataframe_json}
                
                return {"type": result_type, "value": response}
        
        return {"type": "string", "value": "Unfortunately, I don't know how to help you with that."}
