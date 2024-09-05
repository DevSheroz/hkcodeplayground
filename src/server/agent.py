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
    def __init__(self, df, session_id: int):
        self.data = pd.DataFrame(df)
        self.session_id = session_id

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

    
        self.agent = SmartDataframe(self.data, config={
                "llm": self.llm,
                "description": "You are a data analysis agent. Your main goal is to help non-technical users to analyze data.",
                "verbose": False,
                "open_charts": False,
                "save_charts": False,
                "enable_cache": True,
                "memory_size": 50    
            })
    
    def handle_query(self, query):

        # Init logger
        logger = logging.getLogger('pandasai.helpers.logger')
        logger.setLevel(logging.INFO)

        log_stream = StringIO()
        log_handler = logging.StreamHandler(log_stream)
        logger.addHandler(log_handler)

        

        # Generate response using the full context
        response = self.agent.chat(query)
        ic(self.agent.chat(query))
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
                    result = {"type": result_type, "value": f"data:image/png;base64,{plot_url}"}
                elif result_type == 'dataframe':
                    response = response.iloc[:20] # if response is dataframe, only return first 20 rows
                    dataframe_json = response.to_json(orient="split")
                    result = {"type": result_type, "value": dataframe_json}
                else:
                    result = {"type": result_type, "value": response}
            else:
                result = {"type": "string", "value": "Unfortunately, I don't know how to help you with that."}

            return result

        return {"type": "string", "value": "Unfortunately, I don't know how to help you with that."}
