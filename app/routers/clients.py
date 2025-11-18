from fastapi import APIRouter, HTTPException
from app.schemas.schemas import ClientCreate, ClientOut
from app.core.config import supabase

router = APIRouter(prefix="/clients", tags=["Clients"])

@router.post("/", response_model=ClientOut)
def create_client(payload: ClientCreate):
    # Check if CNIC already exists
    existing = supabase.table("clients").select("*").eq("cnic", payload.cnic).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Client already exists")
    
    # Insert client
    res = supabase.table("clients").insert({**payload.dict(), "risk": "Low"}).execute()
    client = res.data[0]
    return client

@router.get("/{client_id}", response_model=ClientOut)
def get_client(client_id: int):
    res = supabase.table("clients").select("*").eq("id", client_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Client not found")
    return res.data[0]
