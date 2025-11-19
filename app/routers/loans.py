"""
Loan API endpoints (for borrowers and admins)
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from app.schemas.schemas import (
    LoanApplicationOut,
    LoanDetailOut,
    LoanStatus,
    RiskCategory
)
from app.services.loan_service import LoanService
from app.core.dependencies import get_current_borrower, get_current_admin, get_optional_user

router = APIRouter(prefix="/loan", tags=["Loans"])


@router.get("/{loan_id}", response_model=LoanDetailOut)
def get_loan_detail(
    loan_id: int,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get loan detail by ID (accessible by borrower or admin)"""
    try:
        loan = LoanService.get_loan_with_borrower(loan_id)
        
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        
        # Check authorization
        if current_user:
            user_id = int(current_user["user_id"])
            role = current_user.get("role")
            
            # Admin can see any loan
            if role == "admin":
                return loan
            
            # Borrower can only see their own loans
            if role == "borrower" and loan.get("borrower_id") != user_id:
                raise HTTPException(
                    status_code=403,
                    detail="You don't have permission to view this loan"
                )
        else:
            # No auth - return limited info or require auth
            raise HTTPException(
                status_code=401,
                detail="Authentication required"
            )
        
        return loan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching loan: {str(e)}"
        )


@router.get("/", response_model=List[LoanApplicationOut])
def get_all_loans(
    status: Optional[LoanStatus] = Query(None, description="Filter by loan status"),
    risk_category: Optional[RiskCategory] = Query(None, description="Filter by risk category"),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    current_user: dict = Depends(get_current_admin)
):
    """Get all loans (admin only) with optional filters"""
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


