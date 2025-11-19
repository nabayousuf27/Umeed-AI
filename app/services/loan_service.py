"""
Service layer for loan operations with Supabase
"""
from typing import List, Optional, Dict
from fastapi import HTTPException
from app.core.config import supabase
from app.schemas.schemas import LoanStatus, RiskCategory
from datetime import datetime


class LoanService:
    @staticmethod
    def create_loan_application(loan_data: dict) -> dict:
        """Create a new loan application"""
        try:
            # Insert loan application
            loan_data["status"] = LoanStatus.PENDING.value
            loan_data["created_at"] = datetime.utcnow().isoformat()
            
            response = supabase.table("loans").insert(loan_data).execute()
            
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to create loan application")
            
            return response.data[0]
        except Exception as e:
            if "duplicate" in str(e).lower():
                raise HTTPException(status_code=400, detail="Loan application already exists")
            raise HTTPException(status_code=500, detail=f"Error creating loan: {str(e)}")
    
    @staticmethod
    def get_loan_by_id(loan_id: int) -> Optional[dict]:
        """Get a single loan by ID"""
        try:
            response = supabase.table("loans").select("*").eq("id", loan_id).execute()
            
            if not response.data:
                return None
            
            return response.data[0]
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching loan: {str(e)}")
    
    @staticmethod
    def get_loans_by_borrower(borrower_id: int) -> List[dict]:
        """Get all loans for a specific borrower"""
        try:
            response = (
                supabase.table("loans")
                .select("*")
                .eq("borrower_id", borrower_id)
                .order("created_at", desc=True)
                .execute()
            )
            
            return response.data or []
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching loans: {str(e)}")
    
    @staticmethod
    def get_all_loans(
        status: Optional[LoanStatus] = None,
        risk_category: Optional[RiskCategory] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[dict]:
        """Get all loans with optional filters"""
        try:
            query = supabase.table("loans").select("*")
            
            if status:
                query = query.eq("status", status.value)
            
            if risk_category:
                query = query.eq("risk_category", risk_category.value)
            
            response = (
                query.order("created_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            
            return response.data or []
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching loans: {str(e)}")
    
    @staticmethod
    def approve_loan(loan_id: int, admin_notes: Optional[str] = None, manual_score: Optional[float] = None) -> dict:
        """Approve a pending loan"""
        try:
            # Get current loan
            loan = LoanService.get_loan_by_id(loan_id)
            if not loan:
                raise HTTPException(status_code=404, detail="Loan not found")
            
            if loan.get("status") != LoanStatus.PENDING.value:
                raise HTTPException(status_code=400, detail=f"Loan is not pending. Current status: {loan.get('status')}")
            
            # Update loan status
            update_data = {
                "status": LoanStatus.ACTIVE.value,
                "approved_at": datetime.utcnow().isoformat()
            }
            
            if admin_notes:
                update_data["admin_notes"] = admin_notes
            
            if manual_score is not None:
                update_data["manual_score"] = manual_score
                # Recalculate final score if both scores exist
                if loan.get("ai_score"):
                    update_data["final_score"] = loan.get("ai_score") + manual_score
            
            response = (
                supabase.table("loans")
                .update(update_data)
                .eq("id", loan_id)
                .execute()
            )
            
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to approve loan")
            
            return response.data[0]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error approving loan: {str(e)}")
    
    @staticmethod
    def reject_loan(loan_id: int, rejection_reason: str, admin_notes: Optional[str] = None) -> dict:
        """Reject a pending loan"""
        try:
            # Get current loan
            loan = LoanService.get_loan_by_id(loan_id)
            if not loan:
                raise HTTPException(status_code=404, detail="Loan not found")
            
            if loan.get("status") != LoanStatus.PENDING.value:
                raise HTTPException(status_code=400, detail=f"Loan is not pending. Current status: {loan.get('status')}")
            
            # Update loan status
            update_data = {
                "status": LoanStatus.REJECTED.value,
                "rejected_at": datetime.utcnow().isoformat(),
                "rejection_reason": rejection_reason
            }
            
            if admin_notes:
                update_data["admin_notes"] = admin_notes
            
            response = (
                supabase.table("loans")
                .update(update_data)
                .eq("id", loan_id)
                .execute()
            )
            
            if not response.data:
                raise HTTPException(status_code=500, detail="Failed to reject loan")
            
            return response.data[0]
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error rejecting loan: {str(e)}")
    
    @staticmethod
    def get_loan_with_borrower(loan_id: int) -> Optional[dict]:
        """Get loan with borrower details (join)"""
        try:
            # Get loan
            loan = LoanService.get_loan_by_id(loan_id)
            if not loan:
                return None
            
            # Get borrower details
            borrower_id = loan.get("borrower_id")
            if borrower_id:
                borrower_response = (
                    supabase.table("borrowers")
                    .select("*")
                    .eq("id", borrower_id)
                    .execute()
                )
                
                if borrower_response.data:
                    loan["borrower"] = borrower_response.data[0]
            
            return loan
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching loan details: {str(e)}")


