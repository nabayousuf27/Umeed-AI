from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class LoanStatus(str, Enum):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    REJECTED = "rejected"


class RiskCategory(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


# Borrower Schemas
class BorrowerCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    cnic: str
    age: int
    password: str


class BorrowerOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    cnic: str
    age: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BorrowerLogin(BaseModel):
    email: EmailStr
    password: str


# Loan Application Schemas
class LoanApplicationCreate(BaseModel):
    borrower_id: int
    loan_amount: float
    loan_duration_days: int
    monthly_income: float
    existing_loans: float
    breadwinner: str  # "yes" or "no"
    household_size: int
    dependents: int
    marital_status: str
    reason: str


class LoanApplicationOut(BaseModel):
    id: int
    borrower_id: int
    loan_amount: float
    loan_duration_days: int
    status: LoanStatus
    ai_score: Optional[float] = None
    manual_score: Optional[float] = None
    final_score: Optional[float] = None
    risk_category: Optional[RiskCategory] = None
    created_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LoanDetailOut(LoanApplicationOut):
    monthly_income: Optional[float] = None
    existing_loans: Optional[float] = None
    breadwinner: Optional[str] = None
    household_size: Optional[int] = None
    dependents: Optional[int] = None
    marital_status: Optional[str] = None
    reason: Optional[str] = None
    borrower: Optional[BorrowerOut] = None


# Loan Approval/Rejection Schemas
class LoanApproval(BaseModel):
    admin_notes: Optional[str] = None
    manual_score: Optional[float] = None


class LoanRejection(BaseModel):
    rejection_reason: str
    admin_notes: Optional[str] = None


# Legacy Client Schemas (for backward compatibility with /clients endpoint)
class ClientCreate(BaseModel):
    name: str
    cnic: str
    phone: Optional[str] = None
    address: Optional[str] = None


class ClientOut(ClientCreate):
    id: int
    risk: Optional[str] = None

    class Config:
        from_attributes = True


# Admin Client/Borrower Schema (for /admin/clients endpoint)
class AdminClientOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str
    cnic: str
    age: int
    total_loans: Optional[int] = 0
    active_loans: Optional[int] = 0
    completed_loans: Optional[int] = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# Dashboard Schema
class DashboardSummary(BaseModel):
    total_clients: int
    total_loans: int
    active_loans: int
    completed_loans: int
    pending_loans: int
    rejected_loans: int
    total_disbursed: float
    total_recovered: float
    avg_risk_score: Optional[float] = None


class RiskDistribution(BaseModel):
    low_risk: int
    medium_risk: int
    high_risk: int
    total: int


class DashboardResponse(BaseModel):
    summary: DashboardSummary
    risk_distribution: RiskDistribution


# Loan List Filters
class LoanFilter(BaseModel):
    status: Optional[LoanStatus] = None
    borrower_id: Optional[int] = None
    risk_category: Optional[RiskCategory] = None


# Response Models
class MessageResponse(BaseModel):
    message: str
    success: bool = True
