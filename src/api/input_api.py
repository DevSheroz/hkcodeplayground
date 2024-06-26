from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import snowflake.connector
from pydantic import BaseModel

import os
from dotenv import load_dotenv

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


load_dotenv()

SNOWFLAKE_USER = os.getenv('SNOWFLAKE_USER')
SNOWFLAKE_PASSWORD = os.getenv('SNOWFLAKE_PASSWORD')
SNOWFLAKE_ACCOUNT = os.getenv('SNOWFLAKE_ACCOUNT')
SNOWFLAKE_DATABASE = os.getenv('SNOWFLAKE_DATABASE')
SNOWFLAKE_SCHEMA = os.getenv('SNOWFLAKE_SCHEMA')


def get_snowflake_connection():
    return snowflake.connector.connect(
        user=SNOWFLAKE_USER,
        password=SNOWFLAKE_PASSWORD,
        account=SNOWFLAKE_ACCOUNT,
        database=SNOWFLAKE_DATABASE,
        schema = SNOWFLAKE_SCHEMA
    )

class ReqNoResponse(BaseModel):
    req_numbers: list[str]

class TestNoResponse(BaseModel):
    test_numbers: list[str]

@app.get("/req_no", response_model=ReqNoResponse)
def req_numbers():
    try:
        with get_snowflake_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT DISTINCT REQ_NO FROM DW_HNT_RSLT_ROAD_WEAR")
                req_no_list = [req[0] for req in cursor.fetchall()]

        return {"req_numbers": req_no_list}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching REQ_NO: {str(e)}")

@app.get("/test_no", response_model=TestNoResponse)
def test_numbers(req_no: str = Query(..., description="REQ_NO for which to fetch TEST_NO")):
    try:
        with get_snowflake_connection() as conn:
            with conn.cursor() as cursor:
                query = "SELECT TEST_NO FROM DW_HNT_RSLT_ROAD_WEAR WHERE REQ_NO = %s"
                cursor.execute(query, (req_no,))
                test_no_list = [item[0] for item in cursor.fetchall()]

        return {"test_numbers": test_no_list}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching TEST_NO: {str(e)}")