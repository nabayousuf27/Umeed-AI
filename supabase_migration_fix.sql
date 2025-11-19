-- =====================================================
-- Migration Fix: Add missing borrower_id column to loans table
-- =====================================================
-- Use this if you already have a loans table but it's missing borrower_id
-- =====================================================

-- Check if loans table exists and add borrower_id if missing
DO $$
BEGIN
    -- Check if borrower_id column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'loans' 
        AND column_name = 'borrower_id'
    ) THEN
        -- Add borrower_id column
        ALTER TABLE loans 
        ADD COLUMN borrower_id BIGINT;
        
        -- If you have existing data, you might need to set a default or update it
        -- For now, we'll make it nullable temporarily, then you can update existing rows
        
        -- Add foreign key constraint (only if borrowers table exists)
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'borrowers') THEN
            ALTER TABLE loans 
            ADD CONSTRAINT fk_loans_borrower 
            FOREIGN KEY (borrower_id) 
            REFERENCES borrowers(id) ON DELETE CASCADE;
            
            -- Make it NOT NULL after adding constraint
            ALTER TABLE loans 
            ALTER COLUMN borrower_id SET NOT NULL;
        END IF;
        
        -- Create index
        CREATE INDEX IF NOT EXISTS idx_loans_borrower_id ON loans(borrower_id);
        
        RAISE NOTICE 'Added borrower_id column to loans table';
    ELSE
        RAISE NOTICE 'borrower_id column already exists in loans table';
    END IF;
END $$;

-- =====================================================
-- Verify the column was added
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'loans' 
AND column_name = 'borrower_id';

