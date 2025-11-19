-- =====================================================
-- Umeed AI Microfinance Loan Management System
-- Complete Database Setup Script
-- =====================================================
-- This script safely creates all tables in the correct order
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Drop existing objects safely
-- =====================================================

-- Drop triggers (only if tables exist)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'repayments') THEN
        DROP TRIGGER IF EXISTS update_repayments_updated_at ON repayments;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'loans') THEN
        DROP TRIGGER IF EXISTS update_loans_updated_at ON loans;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'borrowers') THEN
        DROP TRIGGER IF EXISTS update_borrowers_updated_at ON borrowers;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
    END IF;
END $$;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS repayments CASCADE;
DROP TABLE IF EXISTS loans CASCADE;
DROP TABLE IF EXISTS borrowers CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- =====================================================
-- Step 2: Create tables in correct order
-- =====================================================

-- 1. BORROWERS TABLE (No dependencies - Create first)
-- =====================================================
CREATE TABLE borrowers (
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

CREATE INDEX idx_borrowers_email ON borrowers(email);
CREATE INDEX idx_borrowers_cnic ON borrowers(cnic);
CREATE INDEX idx_borrowers_created_at ON borrowers(created_at DESC);

-- 2. CLIENTS TABLE (No dependencies - Legacy support)
-- =====================================================
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnic VARCHAR(20) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    risk VARCHAR(20) DEFAULT 'Low' CHECK (risk IN ('Low', 'Medium', 'High')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_clients_cnic ON clients(cnic);
CREATE INDEX idx_clients_risk ON clients(risk);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- 3. LOANS TABLE (Depends on borrowers - Create after borrowers)
-- =====================================================
CREATE TABLE loans (
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

CREATE INDEX idx_loans_borrower_id ON loans(borrower_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_loans_risk_category ON loans(risk_category);
CREATE INDEX idx_loans_created_at ON loans(created_at DESC);
CREATE INDEX idx_loans_status_created ON loans(status, created_at DESC);

-- 4. REPAYMENTS TABLE (Depends on loans - Create last)
-- =====================================================
CREATE TABLE repayments (
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

CREATE INDEX idx_repayments_loan_id ON repayments(loan_id);
CREATE INDEX idx_repayments_status ON repayments(status);
CREATE INDEX idx_repayments_payment_date ON repayments(payment_date);
CREATE INDEX idx_repayments_due_date ON repayments(due_date);
CREATE INDEX idx_repayments_loan_status ON repayments(loan_id, status);

-- =====================================================
-- Step 3: Create triggers for updated_at timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
-- Step 4: Verify tables were created
-- =====================================================

DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('borrowers', 'loans', 'clients', 'repayments');
    
    IF table_count = 4 THEN
        RAISE NOTICE 'SUCCESS: All 4 tables created successfully!';
        RAISE NOTICE 'Tables: borrowers, loans, clients, repayments';
    ELSE
        RAISE WARNING 'WARNING: Expected 4 tables, found %', table_count;
    END IF;
END $$;

-- =====================================================
-- END OF SETUP
-- =====================================================

