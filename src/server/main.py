from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from db_influx import InfluxDBHandler
from cache_redis import RedisCache
from collections import defaultdict
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('../api/.env')

INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = "hkcodeplayground"

class ReadingData(BaseModel):
    item_no: str
    start_date: datetime
    end_date: datetime
    limit: Optional[int] = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

influx_handler = InfluxDBHandler(INFLUXDB_URL, INFLUXDB_TOKEN, INFLUXDB_ORG)
redis_cache = RedisCache()




@app.post("/load_data", response_class=JSONResponse)
async def load_data(item_no: str, start_date: str, end_date: str):
    try:
        start_date_dt = datetime.fromisoformat(start_date)
        end_date_dt = datetime.fromisoformat(end_date)
        
        data = influx_handler.query_data_from_influxdb(item_no, start_date_dt, end_date_dt, limit=5)
        limited_data = data[:5] 
    except Exception as e:
        print(f"Error loading data: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    return {"limited_data": limited_data}

@app.post('/full_data/', response_class=JSONResponse)
async def read_data(data: ReadingData):
    cache_key = f"{data.item_no}_{data.start_date}_{data.end_date}"
    cached_data = await redis_cache.get(cache_key)
    if cached_data:
        print(f"Cache hit for key: {cache_key}")
        return {'cachekey': cache_key}
    
    try:
        print(f"Cache miss for key: {cache_key}. Querying InfluxDB.")
        result = influx_handler.query_data_from_influxdb(data.item_no, data.start_date, data.end_date, data.limit)
        await redis_cache.set(cache_key, json.dumps(result))

        return {'cachekey': cache_key}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)