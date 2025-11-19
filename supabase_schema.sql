-- =====================================================
-- Umeed AI Microfinance Loan Management System
-- Supabase Database Schema
-- =====================================================

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. BORROWERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS borrowers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    cnic VARCHAR(20) NOT NULL UNIQUE,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for borrowers
CREATE INDEX IF NOT EXISTS idx_borrowers_email ON borrowers(email);
CREATE INDEX IF NOT EXISTS idx_borrowers_cnic ON borrowers(cnic);
CREATE INDEX IF NOT EXISTS idx_borrowers_created_at ON borrowers(created_at DESC);

-- =====================================================
-- 2. LOANS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS loans (
    id BIGSERIAL PRIMARY KEY,
    borrower_id BIGINT NOT NULL REFERENCES borrowers(id) ON DELETE CASCADE,
    
    -- Loan Application Details
    loan_amount DECIMAL(12, 2) NOT NULL CHECK (loan_amount > 0),
    loan_duration_days INTEGER NOT NULL CHECK (loan_duration_days > 0),
    
    -- Borrower Financial Information
    monthly_income DECIMAL(12, 2) NOT NULL CHECK (monthly_income >= 0),
    existing_loans DECIMAL(12, 2) DEFAULT 0 CHECK (existing_loans >= 0),
    
    -- Household Information
    breadwinner VARCHAR(10) NOT NULL CHECK (breadwinner IN ('yes', 'no')),
    household_size INTEGER NOT NULL CHECK (household_size > 0),
    dependents INTEGER NOT NULL CHECK (dependents >= 0),
    marital_status VARCHAR(50) NOT NULL,
    reason TEXT NOT NULL,
    
    -- Loan Status and Scoring
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'rejected')),
    ai_score DECIMAL(5, 2) CHECK (ai_score >= 0 AND ai_score <= 300),
    manual_score DECIMAL(5, 2) CHECK (manual_score >= 0),
    final_score DECIMAL(5, 2) CHECK (final_score >= 0),
    risk_category VARCHAR(20) CHECK (risk_category IN ('Low', 'Medium', 'High')),
    
    -- Admin Fields
    admin_notes TEXT,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for loans
CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_risk_category ON loans(risk_category);
CREATE INDEX IF NOT EXISTS idx_loans_created_at ON loans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loans_status_created ON loans(status, created_at DESC);

-- =====================================================
-- 3. CLIENTS TABLE (Legacy Support)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnic VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    risk VARCHAR(20) DEFAULT 'Low' CHECK (risk IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_cnic ON clients(cnic);
CREATE INDEX IF NOT EXISTS idx_clients_risk ON clients(risk);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at DESC);

-- =====================================================
-- 4. REPAYMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS repayments (
    id BIGSERIAL PRIMARY KEY,
    loan_id BIGINT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    
    -- Repayment Details
    amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    due_date DATE,
    
    -- Payment Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    
    -- Payment Method
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for repayments
CREATE INDEX IF NOT EXISTS idx_repayments_loan_id ON repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_repayments_status ON repayments(status);
CREATE INDEX IF NOT EXISTS idx_repayments_payment_date ON repayments(payment_date);
CREATE INDEX IF NOT EXISTS idx_repayments_due_date ON repayments(due_date);
CREATE INDEX IF NOT EXISTS idx_repayments_loan_status ON repayments(loan_id, status);

-- =====================================================
-- 5. UPDATE TRIGGERS (for updated_at timestamps)
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_borrowers_updated_at
    BEFORE UPDATE ON borrowers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loans_updated_at
    BEFORE UPDATE ON loans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repayments_updated_at
    BEFORE UPDATE ON repayments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE borrowers ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE repayments ENABLE ROW LEVEL SECURITY;

-- Note: You'll need to create specific policies based on your authentication setup
-- Example policies (adjust based on your auth system):

-- Borrowers can view their own data
CREATE POLICY "Borrowers can view own profile"
    ON borrowers FOR SELECT
    USING (auth.uid()::text = id::text);

-- Borrowers can view their own loans
CREATE POLICY "Borrowers can view own loans"
    ON loans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM borrowers
            WHERE borrowers.id = loans.borrower_id
            AND borrowers.id::text = auth.uid()::text
        )
    );

-- Admins can view all (adjust based on your admin role check)
-- CREATE POLICY "Admins can view all loans"
--     ON loans FOR SELECT
--     USING (
--         EXISTS (
--             SELECT 1 FROM auth.users
--             WHERE auth.users.id = auth.uid()
--             AND auth.users.raw_user_meta_data->>'role' = 'admin'
--         )
--     );

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Function to get loan statistics for a borrower
CREATE OR REPLACE FUNCTION get_borrower_loan_stats(borrower_id_param BIGINT)
RETURNS TABLE (
    total_loans BIGINT,
    active_loans BIGINT,
    completed_loans BIGINT,
    pending_loans BIGINT,
    rejected_loans BIGINT,
    total_borrowed DECIMAL,
    total_repaid DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_loans,
        COUNT(*) FILTER (WHERE status = 'active')::BIGINT as active_loans,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_loans,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_loans,
        COUNT(*) FILTER (WHERE status = 'rejected')::BIGINT as rejected_loans,
        COALESCE(SUM(loan_amount) FILTER (WHERE status IN ('active', 'completed')), 0) as total_borrowed,
        COALESCE(SUM(r.amount) FILTER (WHERE r.status = 'paid'), 0) as total_repaid
    FROM loans l
    LEFT JOIN repayments r ON l.id = r.loan_id
    WHERE l.borrower_id = borrower_id_param;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Uncomment below to insert sample data for testing

-- INSERT INTO borrowers (full_name, email, phone, cnic, age, password_hash) VALUES
-- ('John Doe', 'john@example.com', '03001234567', '1234567890123', 30, 'hashed_password_here'),
-- ('Jane Smith', 'jane@example.com', '03009876543', '9876543210987', 28, 'hashed_password_here');

-- INSERT INTO clients (name, cnic, phone, address, risk) VALUES
-- ('Naba Yousuf', '1234567890123', '03001234567', 'Karachi', 'Low'),
-- ('Test Client', '9876543210987', '03009876543', 'Lahore', 'Medium');

-- =====================================================
-- END OF SCHEMA
-- =====================================================

