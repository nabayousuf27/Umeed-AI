"""
Admin API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime, timedelta
import jwt
import os
from pydantic import BaseModel
from app.schemas.schemas import (
    AdminClientOut,
    LoanApplicationOut,
    LoanDetailOut,
    LoanApproval,
    LoanRejection,
    DashboardResponse,
    MessageResponse,
    LoanStatus,
    RiskCategory
)
from app.services.borrower_service import BorrowerService
from app.services.loan_service import LoanService
from app.services.dashboard_service import DashboardService
from app.core.dependencies import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

from app.core.config import (
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    JWT_EXPIRATION_HOURS,
    ADMIN_EMAIL,
    ADMIN_PASSWORD
)




class AdminLogin(BaseModel):
    email: str
    password: str


@router.post("/login")
def admin_login(credentials: AdminLogin):
    """Admin login endpoint"""
    try:
        # Simple admin authentication (in production, use database)
        if credentials.email != ADMIN_EMAIL or credentials.password != ADMIN_PASSWORD:
            raise HTTPException(
                status_code=401,
                detail="Invalid admin credentials"
            )
        
        # Generate JWT token with admin role
        expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        payload = {
            "sub": "admin",
            "user_id": "admin",
            "role": "admin",
            "exp": expiration,
            "iat": datetime.utcnow()
        }
        
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        return {
            "token": token,
            "admin_id": "admin",
            "role": "admin"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error during admin login: {str(e)}"
        )


@router.get("/clients", response_model=List[AdminClientOut])
def get_all_clients(
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_admin)
):
    """Get all borrowers/clients (admin only)"""
    try:
        borrowers = BorrowerService.get_all_borrowers(limit=limit, offset=offset)
        return borrowers
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching clients: {str(e)}"
        )


@router.get("/loans", response_model=List[LoanApplicationOut])
def get_all_loans_admin(
    status: Optional[LoanStatus] = Query(None, description="Filter by loan status"),
    risk_category: Optional[RiskCategory] = Query(None, description="Filter by risk category"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_admin)
):
    """Get all loans with filters (admin only)"""
    try:
        loans = LoanService.get_all_loans(
            status=status,
            risk_category=risk_category,
            limit=limit,
            offset=offset
        )
        return loans
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching loans: {str(e)}"
        )


@router.get("/loan/{loan_id}", response_model=LoanDetailOut)
def get_loan_detail_admin(
    loan_id: int,
    current_user: dict = Depends(get_current_admin)
):
    """Get loan detail by ID (admin only)"""
    try:
        loan = LoanService.get_loan_with_borrower(loan_id)
        
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        
        return loan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching loan: {str(e)}"
        )


@router.post("/loan/{loan_id}/approve", response_model=LoanApplicationOut)
def approve_loan(
    loan_id: int,
    approval: LoanApproval,
    current_user: dict = Depends(get_current_admin)
):
    """Approve a pending loan (admin only)"""
    try:
        approved_loan = LoanService.approve_loan(
            loan_id=loan_id,
            admin_notes=approval.admin_notes,
            manual_score=approval.manual_score
        )
        return approved_loan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error approving loan: {str(e)}"
        )


@router.post("/loan/{loan_id}/reject", response_model=LoanApplicationOut)
def reject_loan(
    loan_id: int,
    rejection: LoanRejection,
    current_user: dict = Depends(get_current_admin)
):
    """Reject a pending loan (admin only)"""
    try:
        rejected_loan = LoanService.reject_loan(
            loan_id=loan_id,
            rejection_reason=rejection.rejection_reason,
            admin_notes=rejection.admin_notes
        )
        return rejected_loan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error rejecting loan: {str(e)}"
        )


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    current_user: dict = Depends(get_current_admin)
):
    """Get dashboard summary and analytics (admin only)"""
    try:
        summary = DashboardService.get_dashboard_summary()
        risk_distribution = DashboardService.get_risk_distribution()
        
        return {
            "summary": summary,
            "risk_distribution": risk_distribution
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching dashboard data: {str(e)}"
        )

