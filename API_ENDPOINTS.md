# Umeed AI - API Endpoints Reference

Complete API documentation for the FastAPI backend.

## Base URL
```
http://localhost:8000
```

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Borrower Endpoints

### Authentication

#### Sign Up
```http
POST /borrower/signup
Content-Type: application/json

{
  "full_name": "Aisha Khan",
  "email": "aisha@example.com",
  "phone": "+92 300 1234567",
  "cnic": "42101-1234567-1",
  "age": 32,
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "id": 1,
  "full_name": "Aisha Khan",
  "email": "aisha@example.com",
  "phone": "+92 300 1234567",
  "cnic": "42101-1234567-1",
  "age": 32,
  "created_at": "2024-01-10T10:00:00"
}
```

#### Login
```http
POST /borrower/login
Content-Type: application/json

{
  "email": "aisha@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "token": "mock_token_1",
  "borrower_id": 1,
  "borrower": { ... }
}
```

### Loan Operations

#### Apply for Loan
```http
POST /apply-loan
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
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
}
```

**Response:**
```json
{
  "id": 1,
  "borrower_id": 1,
  "loan_amount": 20000,
  "loan_duration_days": 60,
  "status": "pending",
  "ai_score": 75.5,
  "risk_category": "Low",
  "created_at": "2024-01-10T10:00:00"
}
```

#### Get All Loans (Borrower)
```http
GET /borrower/loans
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
[
  {
    "id": 1,
    "borrower_id": 1,
    "loan_amount": 20000,
    "status": "active",
    "ai_score": 75.5,
    "final_score": 240,
    "risk_category": "Low",
    "created_at": "2024-01-10T10:00:00"
  }
]
```

#### Get Loan Detail
```http
GET /loan/{loan_id}
Authorization: Bearer YOUR_TOKEN
```

**Response:**
```json
{
  "id": 1,
  "borrower_id": 1,
  "loan_amount": 20000,
  "loan_duration_days": 60,
  "status": "active",
  "ai_score": 75.5,
  "manual_score": 165,
  "final_score": 240,
  "risk_category": "Low",
  "monthly_income": 50000,
  "existing_loans": 5000,
  "breadwinner": "yes",
  "household_size": 4,
  "dependents": 2,
  "marital_status": "married",
  "reason": "Business expansion",
  "borrower": {
    "id": 1,
    "full_name": "Aisha Khan",
    "email": "aisha@example.com",
    ...
  }
}
```

#### Get Current Borrower Profile
```http
GET /borrower/me
Authorization: Bearer YOUR_TOKEN
```

---

## Admin Endpoints

### Client Management

#### Get All Clients
```http
GET /admin/clients?limit=100&offset=0
Authorization: Bearer ADMIN_TOKEN
```

**Response:**
```json
[
  {
    "id": 1,
    "full_name": "Aisha Khan",
    "email": "aisha@example.com",
    "phone": "+92 300 1234567",
    "cnic": "42101-1234567-1",
    "age": 32,
    "total_loans": 2,
    "active_loans": 1,
    "completed_loans": 1,
    "created_at": "2024-01-10T10:00:00"
  }
]
```

### Loan Management

#### Get All Loans (Admin)
```http
GET /admin/loans?status=active&risk_category=Low&limit=100&offset=0
Authorization: Bearer ADMIN_TOKEN
```

**Query Parameters:**
- `status`: `pending`, `active`, `completed`, `rejected` (optional)
- `risk_category`: `Low`, `Medium`, `High` (optional)
- `limit`: Number of results (default: 100, max: 1000)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "borrower_id": 1,
    "loan_amount": 20000,
    "status": "active",
    "ai_score": 75.5,
    "final_score": 240,
    "risk_category": "Low",
    "created_at": "2024-01-10T10:00:00"
  }
]
```

#### Get Loan Detail (Admin)
```http
GET /admin/loan/{loan_id}
Authorization: Bearer ADMIN_TOKEN
```

#### Approve Loan
```http
POST /admin/loan/{loan_id}/approve
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "admin_notes": "Approved after manual review",
  "manual_score": 165
}
```

**Response:**
```json
{
  "id": 1,
  "status": "active",
  "approved_at": "2024-01-10T11:00:00",
  "admin_notes": "Approved after manual review",
  "manual_score": 165,
  "final_score": 240.5
}
```

#### Reject Loan
```http
POST /admin/loan/{loan_id}/reject
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "rejection_reason": "Insufficient income",
  "admin_notes": "Monthly income too low for requested amount"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "rejected",
  "rejected_at": "2024-01-10T11:00:00",
  "rejection_reason": "Insufficient income",
  "admin_notes": "Monthly income too low for requested amount"
}
```

### Dashboard

#### Get Dashboard Summary
```http
GET /admin/dashboard
Authorization: Bearer ADMIN_TOKEN
```

**Response:**
```json
{
  "summary": {
    "total_clients": 142,
    "total_loans": 156,
    "active_loans": 45,
    "completed_loans": 98,
    "pending_loans": 10,
    "rejected_loans": 3,
    "total_disbursed": 3120000,
    "total_recovered": 2850000,
    "avg_risk_score": 235.5
  },
  "risk_distribution": {
    "low_risk": 65,
    "medium_risk": 52,
    "high_risk": 25,
    "total": 142
  }
}
```

---

## Legacy Endpoints (Backward Compatibility)

#### Get Clients
```http
GET /clients
```

#### Create Client
```http
POST /clients
Content-Type: application/json

{
  "name": "John Doe",
  "cnic": "1234567890123",
  "phone": "03001234567",
  "address": "Karachi"
}
```

---

## Error Responses

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Validation error or invalid input
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "detail": "Error message here"
}
```

---

## Testing

### Using curl

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

# Get borrower loans
curl -X GET "http://localhost:8000/borrower/loans" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get dashboard (admin)
curl -X GET "http://localhost:8000/admin/dashboard" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Using Python requests

```python
import requests

BASE_URL = "http://localhost:8000"
TOKEN = "YOUR_TOKEN"

# Apply for loan
response = requests.post(
    f"{BASE_URL}/apply-loan",
    headers={"Authorization": f"Bearer {TOKEN}"},
    json={
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
    }
)
print(response.json())
```

---

## Interactive API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

These interfaces allow you to test all endpoints directly from your browser.


