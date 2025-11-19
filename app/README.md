# Umeed AI - FastAPI Backend

Complete FastAPI backend for the Umeed AI Microfinance Loan Management System with Supabase integration.

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Borrower Endpoints

#### Authentication
- `POST /borrower/signup` - Create a new borrower account
- `POST /borrower/login` - Authenticate borrower

#### Loan Operations
- `POST /apply-loan` or `POST /borrower/apply-loan` - Apply for a new loan
- `GET /borrower/loans` - Get all loans for logged-in borrower
- `GET /loan/{loan_id}` - Get loan detail (borrower can only see their own loans)
- `GET /borrower/me` - Get current borrower's profile

### Admin Endpoints

#### Client Management
- `GET /admin/clients` - List all borrowers/clients
- `GET /admin/clients/{client_id}` - Get client details

#### Loan Management
- `GET /admin/loans` - List all loans (with filters: status, risk_category)
- `GET /admin/loan/{loan_id}` - Get loan detail
- `POST /admin/loan/{loan_id}/approve` - Approve a pending loan
- `POST /admin/loan/{loan_id}/reject` - Reject a pending loan

#### Dashboard
- `GET /admin/dashboard` - Get dashboard summary and analytics

### Legacy Endpoints (Backward Compatibility)
- `GET /clients` - List clients
- `POST /clients` - Create client

## Database Schema

The backend expects the following Supabase tables:

### `borrowers` table
- `id` (integer, primary key)
- `full_name` (text)
- `email` (text, unique)
- `phone` (text)
- `cnic` (text, unique)
- `age` (integer)
- `password_hash` (text)
- `created_at` (timestamp)

### `loans` table
- `id` (integer, primary key)
- `borrower_id` (integer, foreign key to borrowers.id)
- `loan_amount` (numeric)
- `loan_duration_days` (integer)
- `status` (text: 'pending', 'active', 'completed', 'rejected')
- `ai_score` (numeric)
- `manual_score` (numeric)
- `final_score` (numeric)
- `risk_category` (text: 'Low', 'Medium', 'High')
- `monthly_income` (numeric)
- `existing_loans` (numeric)
- `breadwinner` (text)
- `household_size` (integer)
- `dependents` (integer)
- `marital_status` (text)
- `reason` (text)
- `admin_notes` (text, nullable)
- `rejection_reason` (text, nullable)
- `created_at` (timestamp)
- `approved_at` (timestamp, nullable)
- `rejected_at` (timestamp, nullable)

## Authentication

Currently, the authentication system uses a simplified JWT token approach. In production, you should:

1. Use Supabase Auth for proper authentication
2. Verify JWT tokens properly with Supabase
3. Implement refresh tokens
4. Use secure password hashing (bcrypt instead of SHA256)

## Error Handling

All endpoints include proper error handling:
- 400: Bad Request (validation errors, duplicate entries)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error (database or server errors)

## Project Structure

```
app/
├── core/
│   ├── config.py          # Supabase configuration
│   └── dependencies.py    # Authentication dependencies
├── models/
│   └── models.py          # Database models (if using ORM)
├── routers/
│   ├── borrower.py        # Borrower endpoints
│   ├── loans.py           # Loan endpoints
│   ├── admin.py           # Admin endpoints
│   └── clients.py         # Legacy client endpoints
├── schemas/
│   └── schemas.py         # Pydantic schemas
├── services/
│   ├── borrower_service.py    # Borrower business logic
│   ├── loan_service.py        # Loan business logic
│   ├── dashboard_service.py   # Dashboard analytics
│   └── risk_score.py          # AI risk scoring
└── main.py                # FastAPI application
```

## Testing

Test the API using the interactive docs at `/docs` or use tools like:
- Postman
- curl
- httpie

Example request:

```bash
# Apply for a loan
curl -X POST "http://localhost:8000/apply-loan" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "borrower_id": 1,
    "loan_amount": 20000,
    "loan_duration_days": 60,
    "monthly_income": 50000,
    "existing_loans": 5000,
    "breadwinner": "yes",
    "household_size": 4,
    "dependents": 2,
    "marital_status": "married",
    "reason": "Business expansion"
  }'
```

## Notes

- The risk scoring service (`risk_score.py`) currently uses mock logic. Replace with your actual ML model.
- Password hashing uses SHA256 for simplicity. Use bcrypt in production.
- JWT token verification is simplified. Implement proper Supabase Auth integration for production.


