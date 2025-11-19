"""
Service layer for dashboard analytics with Supabase
"""
from typing import Dict
from fastapi import HTTPException
from app.core.config import supabase
from app.schemas.schemas import LoanStatus, RiskCategory


class DashboardService:
    @staticmethod
    def get_dashboard_summary() -> Dict:
        """Get dashboard summary statistics"""
        try:
            # Get total clients
            clients_response = supabase.table("borrowers").select("id", count="exact").execute()
            total_clients = clients_response.count if hasattr(clients_response, 'count') else len(clients_response.data or [])
            
            # Get all loans
            loans_response = supabase.table("loans").select("*").execute()
            all_loans = loans_response.data or []
            
            total_loans = len(all_loans)
            active_loans = sum(1 for loan in all_loans if loan.get("status") == LoanStatus.ACTIVE.value)
            completed_loans = sum(1 for loan in all_loans if loan.get("status") == LoanStatus.COMPLETED.value)
            pending_loans = sum(1 for loan in all_loans if loan.get("status") == LoanStatus.PENDING.value)
            rejected_loans = sum(1 for loan in all_loans if loan.get("status") == LoanStatus.REJECTED.value)
            
            # Calculate totals
            total_disbursed = sum(
                loan.get("loan_amount", 0) 
                for loan in all_loans 
                if loan.get("status") in [LoanStatus.ACTIVE.value, LoanStatus.COMPLETED.value]
            )
            
            # For now, assume recovered is same as completed loans total
            # In production, calculate from repayment records
            total_recovered = sum(
                loan.get("loan_amount", 0) 
                for loan in all_loans 
                if loan.get("status") == LoanStatus.COMPLETED.value
            )
            
            # Calculate average risk score
            loans_with_scores = [
                loan for loan in all_loans 
                if loan.get("final_score") is not None
            ]
            avg_risk_score = None
            if loans_with_scores:
                avg_risk_score = sum(loan.get("final_score", 0) for loan in loans_with_scores) / len(loans_with_scores)
            
            return {
                "total_clients": total_clients,
                "total_loans": total_loans,
                "active_loans": active_loans,
                "completed_loans": completed_loans,
                "pending_loans": pending_loans,
                "rejected_loans": rejected_loans,
                "total_disbursed": total_disbursed,
                "total_recovered": total_recovered,
                "avg_risk_score": round(avg_risk_score, 2) if avg_risk_score else None
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching dashboard summary: {str(e)}")
    
    @staticmethod
    def get_risk_distribution() -> Dict:
        """Get risk category distribution"""
        try:
            loans_response = supabase.table("loans").select("risk_category").execute()
            loans = loans_response.data or []
            
            low_risk = sum(1 for loan in loans if loan.get("risk_category") == RiskCategory.LOW.value)
            medium_risk = sum(1 for loan in loans if loan.get("risk_category") == RiskCategory.MEDIUM.value)
            high_risk = sum(1 for loan in loans if loan.get("risk_category") == RiskCategory.HIGH.value)
            total = len(loans)
            
            return {
                "low_risk": low_risk,
                "medium_risk": medium_risk,
                "high_risk": high_risk,
                "total": total
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching risk distribution: {str(e)}")


