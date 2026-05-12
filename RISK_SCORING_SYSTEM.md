# Risk Scoring System Documentation

## Overview

The Umeed AI system uses an AI-based risk profiling system with automatic loan approval/rejection based on risk categories.

## Risk Score Scale

**Score Range: 0-100** (where lower is better)

- **Low Risk**: 0-50 → Auto-approved
- **Medium Risk**: 50-80 → Pending admin review
- **High Risk**: 80-100 → Auto-rejected

## Risk Categories

### Low Risk (0-50)
- **Action**: Automatically approved
- **Status**: Set to `active` immediately
- **Admin Notes**: "Auto-approved: Low risk profile"
- **Approved At**: Timestamp set automatically

### Medium Risk (50-80)
- **Action**: Requires admin review
- **Status**: Set to `pending`
- **Admin Notes**: "Pending admin review: Medium risk profile"
- **Admin Decision**: Admin can approve or reject manually

### High Risk (80-100)
- **Action**: Automatically rejected
- **Status**: Set to `rejected` immediately
- **Rejection Reason**: "Auto-rejected: High risk profile based on AI assessment"
- **Rejected At**: Timestamp set automatically

## Scoring Factors

The AI risk score considers:

1. **Loan-to-Income Ratio** (higher ratio = higher risk)
   - Ratio > 100%: +20 points
   - Ratio 50-100%: +10 points
   - Ratio 30-50%: +5 points
   - Ratio < 20%: -10 points (lower risk)

2. **Monthly Income** (lower income = higher risk)
   - < 20,000 PKR: +15 points
   - 20,000-30,000 PKR: +8 points
   - > 50,000 PKR: -10 points (lower risk)
   - > 40,000 PKR: -5 points

3. **Existing Loans** (more existing loans = higher risk)
   - > 10,000 PKR: +15 points
   - 5,000-10,000 PKR: +8 points
   - No existing loans: -10 points (lower risk)

4. **Breadwinner Status**
   - Sole breadwinner: +8 points
   - Not sole breadwinner: -5 points

5. **Household Size**
   - > 6 people: +8 points
   - 4-6 people: +4 points
   - ≤ 3 people: -5 points

6. **Dependents**
   - > 4 dependents: +10 points
   - 2-4 dependents: +5 points
   - No dependents: -5 points

7. **Age** (if available)
   - < 25 years: +5 points
   - > 50 years: +3 points
   - 30-45 years: -5 points (prime age)

## Final Score Calculation

- **Initial**: `final_score = ai_score` (when loan is created)
- **After Admin Review**: `final_score = (ai_score × 0.7) + (manual_score × 0.3)`
  - 70% weight on AI score
  - 30% weight on admin manual score

## Workflow

### 1. Loan Application Submitted
```
Borrower applies → AI calculates risk score → Risk category determined
```

### 2. Automatic Decision
```
Low Risk (0-50)     → Auto-approved → Status: ACTIVE
Medium Risk (50-80) → Pending review → Status: PENDING
High Risk (80-100)  → Auto-rejected → Status: REJECTED
```

### 3. Admin Review (Medium Risk Only)
```
Admin reviews → Can approve or reject → Updates status manually
```

## Database Fields

- `ai_score`: DECIMAL(5,2) - AI calculated score (0-100)
- `manual_score`: DECIMAL(5,2) - Admin manual score (0-100, optional)
- `final_score`: DECIMAL(5,2) - Final combined score (0-100)
- `risk_category`: VARCHAR(20) - "Low", "Medium", or "High"
- `status`: VARCHAR(20) - "pending", "active", "completed", "rejected"

## API Behavior

### POST /borrower/apply-loan
- Calculates AI risk score
- Determines risk category
- Automatically sets status based on risk:
  - Low → `active` (approved)
  - Medium → `pending` (admin review)
  - High → `rejected` (rejected)

### POST /admin/loan/{id}/approve
- Only works for `pending` loans
- Admin can add manual score
- Final score recalculated: 70% AI + 30% manual

### POST /admin/loan/{id}/reject
- Only works for `pending` loans
- Requires rejection reason
- Sets status to `rejected`

## Frontend Display

- Risk scores displayed as "X / 100"
- Progress bars use 0-100 scale
- Risk categories shown with color-coded badges:
  - Low: Green
  - Medium: Yellow/Orange
  - High: Red

## Notes

- The scoring model is currently a mock implementation
- Replace `calculate_risk_score()` in `app/services/risk_score.py` with your actual ML model
- The automatic approval/rejection can be disabled by modifying the loan creation logic
- Manual scores are optional and only used when admin reviews medium-risk loans

