"""
FastAPI application for Umeed AI Microfinance Loan Management System
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.routers import borrower, loans, admin, clients

app = FastAPI(
    title="Umeed AI - Microfinance Loan Management System",
    description="API for managing microfinance loans, borrowers, and admin operations",
    version="1.0.0"
)

# Enable CORS for frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(borrower.router)
app.include_router(loans.router)
app.include_router(admin.router)
app.include_router(clients.router)  # Keep existing clients router for backward compatibility

# Route alias for /apply-loan (redirects to borrower endpoint)
from app.schemas.schemas import LoanApplicationCreate, LoanApplicationOut
from app.services.loan_service import LoanService
from app.services.risk_score import calculate_risk_score, get_risk_category
from app.core.dependencies import get_current_borrower

@app.post("/apply-loan", response_model=LoanApplicationOut, status_code=201)
def apply_loan_alias(
    loan_application: LoanApplicationCreate,
    current_user: dict = Depends(get_current_borrower)
):
    """Alias for /borrower/apply-loan - Apply for a new loan"""
    from fastapi import HTTPException, status
    
    try:
        # Verify borrower owns this application
        if loan_application.borrower_id != int(current_user["user_id"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only apply for loans on your own behalf"
            )
        
        # Calculate AI risk score
        loan_data = loan_application.dict()
        ai_score = calculate_risk_score(loan_data)
        
        # Determine risk category
        loan_data["ai_score"] = ai_score
        loan_data["risk_category"] = get_risk_category(ai_score)
        
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


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Umeed AI Microfinance Loan Management System API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


# #testing endpoint

# from fastapi import FastAPI
# from app.core.config import supabase

# app = FastAPI()

# @app.get("/test")
# def test_insert():
#     try:
#         res = supabase.table("clients").insert({
#             "name": "Naba Yousuf",
#             "cnic": "1234567890123",
#             "phone": "03001234567",
#             "address": "Karachi",
#             "risk": "Low"
#         }).execute()

#         # Return the response safely
#         return {
#             "data": res.data,   # inserted rows
#             "error": res.error  # None if successful
#         }

#     except Exception as e:
#         # Return exception message for debugging
#         return {"error": str(e)}
