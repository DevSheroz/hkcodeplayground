from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from datetime import datetime

from db_influx import InfluxDBHandler
from cache_redis import RedisCache
from model import ReadingData, AlgorithmModel
from filter import DataFilter
from plot import BokehPlotter
from agent import DataAnalysisAgent

import json
import os
import requests
import logging

from dotenv import load_dotenv

# Load environment variables
load_dotenv('../api/.env')

INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = "hkcodeplayground"

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
logging.basicConfig(level=logging.INFO)

@app.post("/load_data", response_class=JSONResponse)
async def load_data(req_no: str, item_no: str, start_date: str, end_date: str):
    try:
        start_date_dt = datetime.fromisoformat(start_date)
        end_date_dt = datetime.fromisoformat(end_date)

        data = influx_handler.query_data_from_influxdb(req_no, item_no, start_date_dt, end_date_dt, limit=5)
        limited_data = data
    except Exception as e:
        print(f"Error loading data: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    return {"limited_data": limited_data}

@app.post('/full_data/', response_class=JSONResponse)
async def read_data(body: ReadingData):
    cache_key = f"{body.item_no}_{body.start_date}_{body.end_date}"
    cached_data = await redis_cache.get(cache_key)
    if cached_data:
        print(f"Cache hit for key: {cache_key}")
        return {'cachekey': cache_key}
    
    try:
        print(f"Cache miss for key: {cache_key}. Querying InfluxDB.")
        result = influx_handler.query_data_from_influxdb(body.req_no, body.item_no, body.start_date, body.end_date)
        await redis_cache.set(cache_key, json.dumps(result))
        return {'cachekey': cache_key}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/first_last_time")
async def get_first_last_time(req_no: str, veh_no: str):
    try:
        veh = veh_no.split(" ")[1]
        start_timestamp, end_timestamp = influx_handler.query_first_last_time(req_no,veh)

        return {"start_timestamp": start_timestamp, "end_timestamp": end_timestamp}
    
    except Exception as e:
        print(f"Error getting first and last time: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/add_algorithm", response_class=JSONResponse)
async def add_algorithm(cache_key: str = Query(...), algorithm_name: str = Query(...)):
    try:
        cached_data = await redis_cache.get(cache_key)
        if not cached_data:
            raise HTTPException(status_code=404, detail="Cache key not found")
        
        data_list = json.loads(cached_data)

        if algorithm_name == "DSN":
            AxValues = [item['x'] for item in data_list]
            AyValues = [item['z'] for item in data_list]
        
            param = {
                'Ax': AxValues,
                'Ay': AyValues,
                'sample_rate': 10
            }

            external_api_url = f"https://uk2lx44ubj.execute-api.ap-northeast-2.amazonaws.com/dev/{algorithm_name.lower()}"
            response = requests.post(external_api_url, json=param)
            response_data = response.json()

            return response_data

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/filtering", response_class=JSONResponse)
async def filtering(cache_key: str = Query(...), filter_parms: dict = Body(...)):
    try:
        # Check for the subcache existence
        subcache_key = f"{cache_key}:filtered"
        cached_data = await redis_cache.get(subcache_key)

        if not cached_data:
            # If no filtered cache, fall back to the original cache
            cached_data = await redis_cache.get(cache_key)

            if not cached_data:
                raise HTTPException(status_code=404, detail="Cache key not found")
        

        data_list = json.loads(cached_data)
        print("received data length: ", len(data_list))
        filter = filter_parms['filterValues']['selectedFilter']
        value = filter_parms['filterValues']['inputValue']
        checkboxes = filter_parms['filterValues']['checkboxes']
        column = filter_parms['filterValues']['header']

        filterClass = DataFilter(
            data=data_list, selected_filter=filter, input_value=value, checkboxes=checkboxes, column=column
        )
        filtered_df = filterClass.apply_filter()
        # filtering 후 결과물이 없을 시 error 전송
        print("processed data length: ", len(filtered_df))
        if filtered_df.empty:
            raise HTTPException(status_code=404, detail="No data after filtering")
        
        filtered_data_json = filtered_df.to_json(orient='records')

        await redis_cache.set(subcache_key, filtered_data_json)
        return JSONResponse(content={"filtered_data": json.loads(filtered_data_json)[:5]})  

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/reset", response_class=JSONResponse)
async def reset(cache_key: str = Query(...)):
    try:
        subcache_key = f"{cache_key}:filtered"
        await redis_cache.delete(subcache_key)
        print("resetting cache")
        original_cached_data = await redis_cache.get(cache_key)
        data = json.loads(original_cached_data)[:5]

        return JSONResponse(content={"reset_data": data})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/plot")
async def plot_data(columns: str = Query(...), cache_key: str = Query(...), plot: str = Query(...)):
    try:
        print(cache_key, plot, columns)
        cached_data = await redis_cache.get(cache_key)
        if cached_data is None:
            raise HTTPException(status_code=404, detail="Cache key not found")

        logging.info(f"Columns: {columns}, Plot: {plot}, Cache Key: {cache_key}")
        full_data = json.loads(cached_data)
        logging.info(f"Full data length: {len(full_data)}")

        subcache_key = f"{cache_key}:filtered"
        subcached_data = await redis_cache.get(subcache_key)
        
        plotter_full = BokehPlotter(full_data, plot, columns, "Full Data")
        plot_json_full = plotter_full.get_plot_json()
        logging.info(f"Full data plot from Bokeh: {plotter_full}")
        
        if subcached_data:
            filter_data = json.loads(subcached_data)
            logging.info(f"Filtered data length: {len(filter_data)}")
            plotter_filter = BokehPlotter(filter_data, plot, columns, "Filtered Data")
            plot_json_filter = plotter_filter.get_plot_json()
        else:
            plot_json_filter = None
        
        return {"full_data": plot_json_full, "filtered_data": plot_json_filter}

    except Exception as e:
        logging.error(f"Error generating plot: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/chat")
async def ask_ai(cache_key: str = Query(...), query: str = Query(...)):

    try:
        subcache_key = f"{cache_key}:filtered"
        cached_data = await redis_cache.get(subcache_key)

        if cached_data is None:
            cached_data = await redis_cache.get(cache_key)

            if cached_data is None:
                raise HTTPException(status_code=404, detail="Cache key not found")

        data = json.loads(cached_data)

        pandasAI = DataAnalysisAgent(data, query)
        response = pandasAI.handle_query(query)
        return response

    except Exception as e:
        logging.error(f"Error in /chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001, reload=True)