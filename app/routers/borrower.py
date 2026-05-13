"""
Borrower API endpoints
"""
from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime, timedelta
import jwt
import os
from app.schemas.schemas import (
    LoanApplicationCreate,
    LoanApplicationOut,
    LoanDetailOut,
    BorrowerCreate,
    BorrowerLogin,
    BorrowerOut,
    MessageResponse
)
from app.services.loan_service import LoanService
from app.services.borrower_service import BorrowerService
from app.core.dependencies import get_current_borrower
from app.services.risk_score import calculate_risk_score, get_risk_category

# JWT Configuration
# CRITICAL SECURITY WARNING: Never hardcode sensitive credentials in the source code.
# Hardcoded secrets are easily discovered in version control history and pose a severe security risk.
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY environment variable must be set")

JWT_EXPIRATION_HOURS = 24

router = APIRouter(prefix="/borrower", tags=["Borrower"])


@router.post("/signup", response_model=BorrowerOut, status_code=status.HTTP_201_CREATED)
def signup_borrower(borrower: BorrowerCreate):
    """Create a new borrower account"""
    try:
        borrower_data = borrower.dict()
        new_borrower = BorrowerService.create_borrower(borrower_data)
        return new_borrower
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating borrower account: {str(e)}"
        )


@router.post("/login", response_model=dict)
def login_borrower(credentials: BorrowerLogin):
    """Authenticate borrower and return JWT token"""
    try:
        borrower = BorrowerService.authenticate_borrower(
            credentials.email,
            credentials.password
        )
        
        if not borrower:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Generate JWT token
        expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
        payload = {
            "sub": str(borrower["id"]),
            "user_id": str(borrower["id"]),
            "role": "borrower",
            "exp": expiration,
            "iat": datetime.utcnow()
        }
        
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        
        return {
            "token": token,
            "borrower_id": borrower["id"],
            "borrower": borrower
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error during login: {str(e)}"
        )


@router.post("/apply-loan", response_model=LoanApplicationOut, status_code=status.HTTP_201_CREATED)
def apply_for_loan(
    loan_application: LoanApplicationCreate,
    current_user: dict = Depends(get_current_borrower)
):
    """Apply for a new loan with automatic approval/rejection based on risk"""
    try:
        # Verify borrower owns this application
        if loan_application.borrower_id != int(current_user["user_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only apply for loans on your own behalf"
            )
        
        # Calculate AI risk score (0-100 scale)
        loan_data = loan_application.dict()
        ai_score = calculate_risk_score(loan_data)
        
        # Determine risk category
        risk_category = get_risk_category(ai_score)
        loan_data["ai_score"] = ai_score
        loan_data["risk_category"] = risk_category
        
        # Automatic approval/rejection based on risk category
        from app.schemas.schemas import LoanStatus
        from datetime import datetime
        
        if risk_category == "Low":
            # Low risk (0-50): Auto-approve
            loan_data["status"] = LoanStatus.ACTIVE.value
            loan_data["approved_at"] = datetime.utcnow().isoformat()
            loan_data["admin_notes"] = "Auto-approved: Low risk profile"
        elif risk_category == "High":
            # High risk (80-100): Auto-reject
            loan_data["status"] = LoanStatus.REJECTED.value
            loan_data["rejected_at"] = datetime.utcnow().isoformat()
            loan_data["rejection_reason"] = "Auto-rejected: High risk profile based on AI assessment"
            loan_data["admin_notes"] = "Auto-rejected due to high risk score"
        else:
            # Medium risk (50-80): Keep as pending for admin review
            loan_data["status"] = LoanStatus.PENDING.value
            loan_data["admin_notes"] = "Pending admin review: Medium risk profile"
        
        # Set final score (same as AI score initially, can be adjusted by admin)
        loan_data["final_score"] = ai_score
        
        # Create loan application
        new_loan = LoanService.create_loan_application(loan_data)
        
        return new_loan
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating loan application: {str(e)}"
        )


@router.get("/loans", response_model=List[LoanApplicationOut])
def get_borrower_loans(current_user: dict = Depends(get_current_borrower)):
    """Get all loans for the logged-in borrower"""
    try:
        borrower_id = int(current_user["user_id"])
        loans = LoanService.get_loans_by_borrower(borrower_id)
        return loans
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching loans: {str(e)}"
        )


@router.get("/me", response_model=BorrowerOut)
def get_current_borrower_info(current_user: dict = Depends(get_current_borrower)):
    """Get current borrower's profile"""
    try:
        borrower_id = int(current_user["user_id"])
        borrower = BorrowerService.get_borrower_by_id(borrower_id)
        
        if not borrower:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Borrower not found"
            )
        
        return borrower
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching borrower profile: {str(e)}"
        )

