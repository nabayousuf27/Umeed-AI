"""
AI Risk Scoring Service
Calculates risk score on a scale of 0-100 where:
- Low Risk: 20-50 (Good borrower, auto-approve)
- Medium Risk: 50-80 (Moderate borrower, admin review)
- High Risk: 80-100 (Risky borrower, auto-reject)

Lower score = Lower risk = Better borrower
Higher score = Higher risk = Riskier borrower
"""
from typing import Dict
import random


def calculate_risk_score(loan_data: Dict) -> float:
    """
    Calculate AI risk score for a loan application (0-100 scale)
    This is a mock implementation - replace with your actual ML model
    
    Risk Categories:
    - Low Risk: 20-50 (Auto-approve)
    - Medium Risk: 50-80 (Admin review)
    - High Risk: 80-100 (Auto-reject)
    
    Args:
        loan_data: Dictionary containing loan application data
        
    Returns:
        Risk score between 0-100 (lower is better, higher = more risky)
    """
    # Start with base risk score (middle of medium range)
    score = 65.0  # Base score (medium risk)
    
    loan_amount = loan_data.get("loan_amount", 0)
    monthly_income = loan_data.get("monthly_income", 0)
    existing_loans = loan_data.get("existing_loans", 0)
    household_size = loan_data.get("household_size", 1)
    dependents = loan_data.get("dependents", 0)
    breadwinner = loan_data.get("breadwinner", "no")
    age = loan_data.get("age", 30)  # If available from borrower
    
    # Calculate loan-to-income ratio (percentage)
    loan_to_income_ratio = (loan_amount / monthly_income * 100) if monthly_income > 0 else 200
    
    # Risk factors (increase score = higher risk = worse borrower)
    # 1. Loan-to-income ratio (higher ratio = higher risk)
    if loan_to_income_ratio > 100:
        score += 25  # Very high risk (loan > income)
    elif loan_to_income_ratio > 80:
        score += 18  # High risk
    elif loan_to_income_ratio > 50:
        score += 10  # Moderate-high risk
    elif loan_to_income_ratio > 30:
        score += 3   # Moderate risk
    elif loan_to_income_ratio < 20:
        score -= 15  # Low risk (good ratio)
    elif loan_to_income_ratio < 15:
        score -= 20  # Very low risk (excellent ratio)
    
    # 2. Monthly income (lower income = higher risk)
    if monthly_income < 20000:
        score += 20  # High risk (low income)
    elif monthly_income < 30000:
        score += 12  # Moderate-high risk
    elif monthly_income < 40000:
        score += 5   # Moderate risk
    elif monthly_income > 60000:
        score -= 15  # Low risk (good income)
    elif monthly_income > 50000:
        score -= 10  # Lower risk
    
    # 3. Existing loans (higher existing loans = higher risk)
    if existing_loans > 15000:
        score += 20  # High risk (high debt burden)
    elif existing_loans > 10000:
        score += 12  # Moderate-high risk
    elif existing_loans > 5000:
        score += 6   # Moderate risk
    elif existing_loans == 0:
        score -= 12  # Low risk (no existing loans)
    
    # 4. Breadwinner status (sole breadwinner = higher risk)
    if breadwinner == "yes":
        score += 8   # Higher risk (sole provider, more pressure)
    else:
        score -= 6   # Lower risk (shared responsibility)
    
    # 5. Household size (larger household = higher risk)
    if household_size > 7:
        score += 10  # Higher risk (large household)
    elif household_size > 5:
        score += 6   # Moderate risk
    elif household_size <= 3:
        score -= 8   # Lower risk (smaller household)
    
    # 6. Dependents (more dependents = higher risk)
    if dependents > 5:
        score += 12  # High risk (many dependents)
    elif dependents > 3:
        score += 7   # Moderate-high risk
    elif dependents > 1:
        score += 3   # Moderate risk
    elif dependents == 0:
        score -= 8   # Lower risk (no dependents)
    
    # 7. Age factor (if available)
    if age < 22:
        score += 8   # Very young = higher risk
    elif age < 25:
        score += 5   # Young = slightly higher risk
    elif age > 60:
        score += 6   # Older = higher risk
    elif age > 55:
        score += 3   # Slightly older = moderate risk
    elif 28 <= age <= 50:
        score -= 8   # Prime age = lower risk
    
    # Add some randomness for mock data (remove in production)
    score += random.uniform(-3, 3)
    
    # Ensure score is between 0 and 100
    score = max(0, min(100, score))
    
    return round(score, 2)


def get_risk_category(score: float) -> str:
    """
    Convert risk score to category based on new scale:
    - Low Risk: 0-50 (Auto-approve)
    - Medium Risk: 50-80 (Admin review)
    - High Risk: 80-100 (Auto-reject)
    """
    if 0 <= score < 50:
        return "Low"  # Low risk (auto-approve)
    elif 50 <= score < 80:
        return "Medium"  # Medium risk (admin review)
    else:  # score >= 80
        return "High"  # High risk (auto-reject)
