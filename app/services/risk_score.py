"""
AI Risk Scoring Service
This is a placeholder - replace with your actual ML model
"""
from typing import Dict


def calculate_risk_score(loan_data: Dict) -> float:
    """
    Calculate AI risk score for a loan application
    This is a mock implementation - replace with your actual ML model
    
    Args:
        loan_data: Dictionary containing loan application data
        
    Returns:
        Risk score between 0-100
    """
    # Mock scoring logic - replace with actual ML model prediction
    score = 50.0  # Base score
    
    # Adjust based on loan amount
    loan_amount = loan_data.get("loan_amount", 0)
    if loan_amount < 10000:
        score += 10
    elif loan_amount > 50000:
        score -= 15
    
    # Adjust based on monthly income
    monthly_income = loan_data.get("monthly_income", 0)
    if monthly_income > 50000:
        score += 15
    elif monthly_income < 20000:
        score -= 10
    
    # Adjust based on existing loans
    existing_loans = loan_data.get("existing_loans", 0)
    if existing_loans == 0:
        score += 10
    elif existing_loans > 10000:
        score -= 15
    
    # Adjust based on household size
    household_size = loan_data.get("household_size", 1)
    if household_size <= 3:
        score += 5
    elif household_size > 6:
        score -= 5
    
    # Adjust based on dependents
    dependents = loan_data.get("dependents", 0)
    if dependents == 0:
        score += 5
    elif dependents > 4:
        score -= 10
    
    # Ensure score is between 0 and 100
    score = max(0, min(100, score))
    
    return round(score, 2)


def get_risk_category(score: float) -> str:
    """Convert risk score to category"""
    if score >= 70:
        return "Low"
    elif score >= 50:
        return "Medium"
    else:
        return "High"
