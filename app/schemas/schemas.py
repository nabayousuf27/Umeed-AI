from pydantic import BaseModel
from typing import Optional

class ClientCreate(BaseModel):
    name: str
    cnic: str
    phone: Optional[str]
    address: Optional[str]

class ClientOut(ClientCreate):
    id: int
    risk: Optional[str]
