"""
Service layer for borrower operations with Supabase
"""
from typing import List, Optional
from fastapi import HTTPException
from app.core.config import supabase
from datetime import datetime
import hashlib


class BorrowerService:
    @staticmethod
    def create_borrower(borrower_data: dict) -> dict:
        """Create a new borrower account"""
        try:
            # Check if email or CNIC already exists
            email_check = (
                supabase.table("borrowers")
                .select("id")
                .eq("email", borrower_data["email"])
                .execute()
            )
            
            if email_check.data:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            cnic_check = (
                supabase.table("borrowers")
                .select("id")
                .eq("cnic", borrower_data["cnic"])
                .execute()
            )
            
            if cnic_check.data:
                raise HTTPException(status_code=400, detail="CNIC already registered")
            
            # Hash password (simple hash - in production use bcrypt)
            password = borrower_data.pop("password")
            borrower_data["password_hash"] = hashlib.sha256(password.encode()).hexdigest()
            borrower_data["created_at"] = datetime.utcnow().isoformat()
            
            # Insert borrower
            response = supabase.table("borrowers").insert(borrower_data).execute()
            
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to create borrower account")
            
            # Remove password hash from response
            borrower = response.data[0]
            borrower.pop("password_hash", None)
            
            return borrower
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating borrower: {str(e)}")
    
    @staticmethod
    def authenticate_borrower(email: str, password: str) -> Optional[dict]:
        """Authenticate borrower and return borrower data"""
        try:
            # Hash password for comparison
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            # Find borrower
            response = (
                supabase.table("borrowers")
                .select("*")
                .eq("email", email)
                .eq("password_hash", password_hash)
                .execute()
            )
            
            if not response.data:
                return None
            
            borrower = response.data[0]
            borrower.pop("password_hash", None)
            
            return borrower
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error authenticating borrower: {str(e)}")
    
    @staticmethod
    def get_borrower_by_id(borrower_id: int) -> Optional[dict]:
        """Get borrower by ID"""
        try:
            response = (
                supabase.table("borrowers")
                .select("*")
                .eq("id", borrower_id)
                .execute()
            )
            
            if not response.data:
                return None
            
            borrower = response.data[0]
            borrower.pop("password_hash", None)
            
            return borrower
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching borrower: {str(e)}")
    
    @staticmethod
    def get_all_borrowers(limit: int = 100, offset: int = 0) -> List[dict]:
        """Get all borrowers with loan statistics"""
        try:
            # Get borrowers
            response = (
                supabase.table("borrowers")
                .select("id, full_name, email, phone, cnic, age, created_at")
                .order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            
            borrowers = response.data or []
            
            # Get loan statistics for each borrower
            for borrower in borrowers:
                borrower_id = borrower["id"]
                
                # Count loans by status
                loans_response = (
                    supabase.table("loans")
                    .select("status")
                    .eq("borrower_id", borrower_id)
                    .execute()
                )
                
                loans = loans_response.data or []
                borrower["total_loans"] = len(loans)
                borrower["active_loans"] = sum(1 for loan in loans if loan.get("status") == "active")
                borrower["completed_loans"] = sum(1 for loan in loans if loan.get("status") == "completed")
            
            return borrowers
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching borrowers: {str(e)}")


