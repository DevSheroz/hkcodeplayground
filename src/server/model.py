from pydantic import BaseModel
from typing import Optional

from datetime import datetime

class ReadingData(BaseModel):
    item_no: str
    start_date: datetime
    end_date: datetime
    limit: Optional[int] = None

class AlgorithmModel(BaseModel):
    cache_key: str
    algorith_name: str