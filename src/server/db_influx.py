from influxdb_client import InfluxDBClient
from influxdb_client.client.exceptions import InfluxDBError
from datetime import datetime

class InfluxDBHandler:
    def __init__(self, url: str, token: str, org: str):
        self.client = InfluxDBClient(url=url, token=token, org=org)
        self.query_api = self.client.query_api()

    def query_data_from_influxdb(self, req_no: str, item_no: str, start_date: datetime, end_date: datetime, limit: int = None):
        veh_no = item_no.split(" ")[1]

        query = f'''
            from(bucket: "hkcodeplayground")
                |> range(start: {start_date.strftime('%Y-%m-%dT%H:%M:%SZ')}, stop: {end_date.strftime('%Y-%m-%dT%H:%M:%SZ')})
                |> filter(fn: (r) => r["_measurement"] == "IMU" and r["req_no"] == "{req_no}" and r["veh_no"] == "{veh_no}")
                |> sort(columns: ["_time"], desc: false)
            '''
        if limit is not None:
            query += f'|> limit(n: {limit})'
        query += '|> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")'
        try:
            tables = self.query_api.query(org=self.client.org, query=query)
        except InfluxDBError as e:
            print(f"InfluxDB query error: {e}")
            raise

        data_list = []
        for table in tables:
            for record in table.records:
                if record is None:
                    continue
                data = record.values
                timestamp_str = data.pop('_time').strftime('%Y-%m-%d %H:%M:%S')
                del_key_list = ['result', 'table', '_start', '_stop', '_measurement', 'veh_no']
                for key in del_key_list:
                    del data[key]
                ordered_data = {'timestamp': timestamp_str}
                ordered_data.update(data)
                data_list.append(ordered_data)
        return data_list
    

    def query_first_last_time(self, req_no:str, veh_no: str):
        try:
            query_first = f'''
            from(bucket: "hkcodeplayground")
                |> range(start: 0)
                |> filter(fn: (r) => r["_measurement"] == "IMU" and r["req_no"] == "{req_no}" and r["veh_no"] == "{veh_no}")
                |> sort(columns: ["_time"], desc: false)
                |> limit(n: 1)
            '''
            first_result = self.query_api.query(org=self.client.org, query=query_first)
            first_time = first_result[0].records[0].get_time()

            query_last = f'''
            from(bucket: "hkcodeplayground")
                |> range(start: 0)
                |> filter(fn: (r) => r["_measurement"] == "IMU" and r["req_no"] == "{req_no}" and r["veh_no"] == "{veh_no}")
                |> sort(columns: ["_time"], desc: true)
                |> limit(n: 1)
            '''
            last_result = self.query_api.query(org=self.client.org, query=query_last)
            last_time = last_result[0].records[0].get_time()

            return first_time, last_time

        except InfluxDBError as e:
            print(f"InfluxDB query error: {e}")
            raise