import os
from fastapi import FastAPI, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from datetime import datetime
from influxdb_client import InfluxDBClient
from influxdb_client.client.exceptions import InfluxDBError
from dotenv import load_dotenv

app = FastAPI()

load_dotenv()

INFLUXDB_URL = os.getenv("INFLUXDB_URL")
INFLUXDB_TOKEN = os.getenv("INFLUXDB_TOKEN")
INFLUXDB_ORG = os.getenv("INFLUXDB_ORG")
INFLUXDB_BUCKET = "hkcodeplayground"

client = InfluxDBClient(url=INFLUXDB_URL, token=INFLUXDB_TOKEN, org=INFLUXDB_ORG)
query_api = client.query_api()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def query_data_from_influxdb(item_no, start_date, end_date):
    veh_no = item_no.split(" ")[1]

    query = f'''
        from(bucket: "hkcodeplayground")
            |> range(start: {start_date.strftime('%Y-%m-%dT%H:%M:%SZ')}, stop: {end_date.strftime('%Y-%m-%dT%H:%M:%SZ')})
            |> filter(fn: (r) => r["_measurement"] == "IMU" and r["veh_no"] == "{veh_no}")
            |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
        '''

    try:
        tables = query_api.query(org=INFLUXDB_ORG, query=query)
    except InfluxDBError as e:
        print(f"InfluxDB query error: {e}")
        raise

    data_list = []
    for table in tables:
        for record in table.records:
            if record is None:
                continue

            data = record.values

            # Rename _time to timestamp and change time format
            timestamp_str = data.pop('_time').strftime('%Y-%m-%d %H:%M:%S')
            # Delete unwanted keys
            del_key_list = ['result', 'table', '_start', '_stop', '_measurement', 'veh_no']
            for key in del_key_list:
                del data[key]

            ordered_data = {'timestamp': timestamp_str}
            ordered_data.update(data)

            data_list.append(ordered_data)

    return data_list

@app.post("/load_data", response_class=JSONResponse)
async def load_data_post(
    item_no: str = Query(..., description="Item number to filter data"),
    start_date: str = Query(..., description="Start date range for data"),
    end_date: str = Query(..., description="End date range for data"),
):
    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    try:
        data = query_data_from_influxdb(item_no, start_date, end_date)
        limited_data = data[:5] 
    except Exception as e:
        print(f"Error loading data: {e}")
        return JSONResponse(status_code=500, content={"error": str(e)})
    return {"limited_data": limited_data}

async def stream_full_data(websocket: WebSocket, item_no: str, start_date: str, end_date: str):
    start_date = datetime.strptime(start_date, "%Y-%m-%d")
    end_date = datetime.strptime(end_date, "%Y-%m-%d")

    try:
        data = query_data_from_influxdb(item_no, start_date, end_date)
        await websocket.send_json({"full_data": data})
    except Exception as e:
        print(f"Error streaming full data: {e}")
        await websocket.send_json({"error": str(e)})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_json()
            item_no = data["item_no"]
            start_date = data["start_date"]
            end_date = data["end_date"]
            await stream_full_data(websocket, item_no, start_date, end_date)
    except WebSocketDisconnect:
        print("Client disconnected")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
