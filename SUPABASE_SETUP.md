# Supabase Database Setup Guide

This guide will help you set up the database tables for the Umeed AI Microfinance Loan Management System.

## Prerequisites

1. You have a Supabase project created
2. You have your Supabase URL and Service Key set as environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`

## Setup Steps

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project dashboard
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the Schema Script**
   - Open the `supabase_schema.sql` file
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click **Run** to execute

3. **Verify Tables Created**
   - Go to **Table Editor** in the left sidebar
   - You should see these tables:
     - `borrowers`
     - `loans`
     - `clients` (legacy)
     - `repayments`

### Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Initialize Supabase (if not already done)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Database Tables Overview

### 1. **borrowers** Table
Stores borrower/user information for the new authentication system.

**Fields:**
- `id` - Primary key (auto-increment)
- `full_name` - Borrower's full name
- `email` - Unique email address
- `phone` - Phone number
- `cnic` - Unique CNIC number
- `age` - Age (18-100)
- `password_hash` - Hashed password
- `created_at` - Timestamp
- `updated_at` - Timestamp

### 2. **loans** Table
Stores all loan applications and their details.

**Fields:**
- `id` - Primary key
- `borrower_id` - Foreign key to borrowers table
- `loan_amount` - Requested loan amount
- `loan_duration_days` - Loan duration in days
- `monthly_income` - Borrower's monthly income
- `existing_loans` - Amount of existing loans
- `breadwinner` - "yes" or "no"
- `household_size` - Number of people in household
- `dependents` - Number of dependents
- `marital_status` - Marital status
- `reason` - Reason for loan
- `status` - pending/active/completed/rejected
- `ai_score` - AI-generated risk score (0-300)
- `manual_score` - Admin manual score
- `final_score` - Combined final score
- `risk_category` - Low/Medium/High
- `admin_notes` - Admin notes
- `rejection_reason` - Reason if rejected
- `created_at`, `approved_at`, `rejected_at`, `completed_at` - Timestamps

### 3. **clients** Table (Legacy)
Legacy table for backward compatibility with existing `/clients` endpoint.

**Fields:**
- `id` - Primary key
- `name` - Client name
- `cnic` - Unique CNIC
- `phone` - Phone number
- `address` - Address
- `risk` - Low/Medium/High
- `created_at`, `updated_at` - Timestamps

### 4. **repayments** Table
Stores loan repayment records.

**Fields:**
- `id` - Primary key
- `loan_id` - Foreign key to loans table
- `amount` - Repayment amount
- `payment_date` - Date of payment
- `due_date` - Due date
- `status` - pending/paid/overdue/partial
- `payment_method` - Payment method
- `transaction_id` - Transaction reference
- `notes` - Additional notes
- `created_at`, `paid_at`, `updated_at` - Timestamps

## Row Level Security (RLS)

The schema includes RLS policies, but you'll need to configure them based on your authentication setup:

1. **For Supabase Auth Integration:**
   - The example policies use `auth.uid()` which works with Supabase Auth
   - Adjust policies based on your user roles

2. **For Custom JWT Authentication:**
   - You may need to disable RLS or create custom policies
   - Update policies to match your JWT token structure

## Testing the Setup

After running the schema, you can test by:

1. **Creating a test borrower:**
   ```sql
   INSERT INTO borrowers (full_name, email, phone, cnic, age, password_hash)
   VALUES ('Test User', 'test@example.com', '03001234567', '1234567890123', 30, 'hashed_password');
   ```

2. **Creating a test client (legacy):**
   ```sql
   INSERT INTO clients (name, cnic, phone, address, risk)
   VALUES ('Test Client', '9876543210987', '03009876543', 'Karachi', 'Low');
   ```

## Next Steps

1. **Configure Authentication:**
   - Set up Supabase Auth or configure your JWT system
   - Update RLS policies accordingly

2. **Test API Endpoints:**
   - Start your FastAPI server: `uvicorn app.main:app --reload`
   - Test endpoints using the API docs at `http://localhost:8000/docs`

3. **Seed Initial Data (Optional):**
   - Create admin users
   - Add sample borrowers/clients for testing

## Troubleshooting

### Error: "relation already exists"
- Tables may already exist. Drop them first or use `CREATE TABLE IF NOT EXISTS` (already included)

### Error: "permission denied"
- Check your Supabase service key permissions
- Ensure you're using the service role key, not the anon key

### RLS Policies Blocking Access
- Temporarily disable RLS for testing:
  ```sql
  ALTER TABLE borrowers DISABLE ROW LEVEL SECURITY;
  ALTER TABLE loans DISABLE ROW LEVEL SECURITY;
  ```
- Remember to re-enable and configure proper policies for production

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify environment variables are set correctly
3. Check FastAPI logs for detailed error messages

