# from fastapi import FastAPI
# from app.routers import clients

# app = FastAPI(title="MLMS - Umeed AI")

# app.include_router(clients.router)

#testing endpoint

from fastapi import FastAPI
from app.core.config import supabase

app = FastAPI()

@app.get("/test")
def test_insert():
    try:
        res = supabase.table("clients").insert({
            "name": "Naba Yousuf",
            "cnic": "1234567890123",
            "phone": "03001234567",
            "address": "Karachi",
            "risk": "Low"
        }).execute()

        # Return the response safely
        return {
            "data": res.data,   # inserted rows
            "error": res.error  # None if successful
        }

    except Exception as e:
        # Return exception message for debugging
        return {"error": str(e)}
