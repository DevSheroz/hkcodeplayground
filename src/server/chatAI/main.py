from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
import pandas as pd
import logging
from ai_agent import DataAnalysisAgent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store preloaded dataset and DataAnalysisAgent instances
preloaded_data = None
agent_store = {}

@app.post("/load_dataset")
async def load_dataset(dataset: str = Query(...), session_id: str = Query(...)):
    global preloaded_data  # Declare to modify the global variable

    try:
        if dataset == 'Financial':
            df = pd.read_csv('../../../test/financial_data.csv')
        elif dataset == 'EP':
            df = pd.read_csv('../../../test/ep_data.csv')
        elif dataset == 'Driving':
            df = pd.read_csv('../../../test/driving_data.csv')
        else:
            raise HTTPException(status_code=404, detail="Dataset not found")

        # Cache the loaded dataset
        preloaded_data = df
        
        logging.info(f"Dataset {dataset} loaded and cached for session {session_id}.")

        return {"message": f"{dataset} dataset loaded successfully for session {session_id}."}

    except Exception as e:
        logging.error(f"Error loading dataset {dataset}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to load dataset {dataset}")

@app.post("/chat")
async def ask_ai(query: str = Query(...), session_id: str = Query(...)):
    global preloaded_data
    try:
        # Ensure the dataset is preloaded
        if preloaded_data is None:
            raise HTTPException(status_code=400, detail="Dataset not preloaded. Please load the dataset first.")

        # Initialize the DataAnalysisAgent if it doesn't exist for the session
        if session_id not in agent_store:
            instance = DataAnalysisAgent(preloaded_data)
            agent_store[session_id] = instance

        agent = agent_store[session_id]
        # Get the full response (dictionary) from the agent
        response = agent.handle_query(query)

        # Return the full dictionary as JSON response
        return response
    
    except Exception as e:
        logging.error(f"Error in /chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reset_agent")
async def reset_agent(session_id: str = Query(...)):
    global preloaded_data
    try:
        # Ensure the dataset is preloaded
        if preloaded_data is None:
            raise HTTPException(status_code=400, detail="Dataset not preloaded. Please load the dataset first.")
        
        # Reinitialize the DataAnalysisAgent for the given session_id
        agent_store[session_id] = DataAnalysisAgent(preloaded_data)
        
        logging.info(f"DataAnalysisAgent reset for session {session_id}.")
        return {"message": f"DataAnalysisAgent reset successfully for session {session_id}."}

    except Exception as e:
        logging.error(f"Error resetting agent for session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to reset agent for session {session_id}")
