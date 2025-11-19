# Database Fields Reference

This document maps the API request/response fields to database table columns.

## Borrowers Table

| API Field (Schema) | Database Column | Type | Notes |
|-------------------|-----------------|------|-------|
| `id` | `id` | BIGSERIAL | Primary key, auto-increment |
| `full_name` | `full_name` | VARCHAR(255) | Required |
| `email` | `email` | VARCHAR(255) | Unique, required |
| `phone` | `phone` | VARCHAR(20) | Required |
| `cnic` | `cnic` | VARCHAR(20) | Unique, required |
| `age` | `age` | INTEGER | Required, 18-100 |
| `password` | `password_hash` | VARCHAR(255) | Hashed with SHA256 (not returned in API) |
| `created_at` | `created_at` | TIMESTAMPTZ | Auto-generated |

**API Endpoints:**
- `POST /borrower/signup` - Creates new borrower
- `POST /borrower/login` - Authenticates borrower
- `GET /borrower/me` - Gets current borrower profile

## Loans Table

| API Field (Schema) | Database Column | Type | Notes |
|-------------------|-----------------|------|-------|
| `id` | `id` | BIGSERIAL | Primary key |
| `borrower_id` | `borrower_id` | BIGINT | Foreign key to borrowers.id |
| `loan_amount` | `loan_amount` | DECIMAL(12,2) | Required, > 0 |
| `loan_duration_days` | `loan_duration_days` | INTEGER | Required, > 0 |
| `monthly_income` | `monthly_income` | DECIMAL(12,2) | Required, >= 0 |
| `existing_loans` | `existing_loans` | DECIMAL(12,2) | Default 0, >= 0 |
| `breadwinner` | `breadwinner` | VARCHAR(10) | "yes" or "no" |
| `household_size` | `household_size` | INTEGER | Required, > 0 |
| `dependents` | `dependents` | INTEGER | Required, >= 0 |
| `marital_status` | `marital_status` | VARCHAR(50) | Required |
| `reason` | `reason` | TEXT | Required |
| `status` | `status` | VARCHAR(20) | pending/active/completed/rejected |
| `ai_score` | `ai_score` | DECIMAL(5,2) | 0-300, auto-calculated |
| `manual_score` | `manual_score` | DECIMAL(5,2) | Set by admin |
| `final_score` | `final_score` | DECIMAL(5,2) | ai_score + manual_score |
| `risk_category` | `risk_category` | VARCHAR(20) | Low/Medium/High, auto-calculated |
| `admin_notes` | `admin_notes` | TEXT | Admin notes |
| `rejection_reason` | `rejection_reason` | TEXT | If rejected |
| `created_at` | `created_at` | TIMESTAMPTZ | Auto-generated |
| `approved_at` | `approved_at` | TIMESTAMPTZ | Set when approved |
| `rejected_at` | `rejected_at` | TIMESTAMPTZ | Set when rejected |
| `completed_at` | `completed_at` | TIMESTAMPTZ | Set when completed |

**API Endpoints:**
- `POST /borrower/apply-loan` - Create loan application
- `GET /borrower/loans` - List borrower's loans
- `GET /loan/{id}` - Get loan details
- `GET /admin/loans` - List all loans (admin)
- `POST /admin/loan/{id}/approve` - Approve loan
- `POST /admin/loan/{id}/reject` - Reject loan

## Clients Table (Legacy)

| API Field (Schema) | Database Column | Type | Notes |
|-------------------|-----------------|------|-------|
| `id` | `id` | BIGSERIAL | Primary key |
| `name` | `name` | VARCHAR(255) | Required |
| `cnic` | `cnic` | VARCHAR(20) | Unique, required |
| `phone` | `phone` | VARCHAR(20) | Optional |
| `address` | `address` | TEXT | Optional |
| `risk` | `risk` | VARCHAR(20) | Low/Medium/High, default "Low" |
| `created_at` | `created_at` | TIMESTAMPTZ | Auto-generated |

**API Endpoints:**
- `POST /clients/` - Create client (legacy)
- `GET /clients/{id}` - Get client (legacy)

## Repayments Table

| API Field (Schema) | Database Column | Type | Notes |
|-------------------|-----------------|------|-------|
| `id` | `id` | BIGSERIAL | Primary key |
| `loan_id` | `loan_id` | BIGINT | Foreign key to loans.id |
| `amount` | `amount` | DECIMAL(12,2) | Required, > 0 |
| `payment_date` | `payment_date` | DATE | Required |
| `due_date` | `due_date` | DATE | Optional |
| `status` | `status` | VARCHAR(20) | pending/paid/overdue/partial |
| `payment_method` | `payment_method` | VARCHAR(50) | Optional |
| `transaction_id` | `transaction_id` | VARCHAR(255) | Optional |
| `notes` | `notes` | TEXT | Optional |
| `created_at` | `created_at` | TIMESTAMPTZ | Auto-generated |
| `paid_at` | `paid_at` | TIMESTAMPTZ | Set when paid |

**Note:** Repayment endpoints are not yet fully implemented in the API.

## Field Validation Rules

### Borrowers
- `email`: Must be unique, valid email format
- `cnic`: Must be unique, 13-20 characters
- `age`: Must be between 18 and 100

### Loans
- `loan_amount`: Must be greater than 0
- `loan_duration_days`: Must be greater than 0
- `monthly_income`: Must be >= 0
- `existing_loans`: Must be >= 0
- `household_size`: Must be > 0
- `dependents`: Must be >= 0
- `breadwinner`: Must be "yes" or "no"
- `status`: Must be one of: pending, active, completed, rejected
- `risk_category`: Must be one of: Low, Medium, High
- `ai_score`: Range 0-300

### Clients (Legacy)
- `cnic`: Must be unique
- `risk`: Must be one of: Low, Medium, High

### Repayments
- `amount`: Must be greater than 0
- `status`: Must be one of: pending, paid, overdue, partial

## Common Queries

### Get all loans for a borrower
```sql
SELECT * FROM loans WHERE borrower_id = ? ORDER BY created_at DESC;
```

### Get loan with borrower details
```sql
SELECT l.*, b.full_name, b.email, b.phone 
FROM loans l 
JOIN borrowers b ON l.borrower_id = b.id 
WHERE l.id = ?;
```

### Get borrower loan statistics
```sql
SELECT 
    COUNT(*) as total_loans,
    COUNT(*) FILTER (WHERE status = 'active') as active_loans,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_loans
FROM loans 
WHERE borrower_id = ?;
```

### Get all repayments for a loan
```sql
SELECT * FROM repayments WHERE loan_id = ? ORDER BY payment_date DESC;
```

