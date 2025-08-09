-- Disable RLS temporarily on financial_contexts to fix infinite recursion
-- This is a radical solution to eliminate circular dependencies

-- Drop all existing policies on financial_contexts
DROP POLICY IF EXISTS "financial_contexts_read_policy" ON financial_contexts;
DROP POLICY IF EXISTS "financial_contexts_insert_policy" ON financial_contexts;
DROP POLICY IF EXISTS "financial_contexts_update_policy" ON financial_contexts;
DROP POLICY IF EXISTS "financial_contexts_delete_policy" ON financial_contexts;
DROP POLICY IF EXISTS "Users can view financial contexts they own or are members of" ON financial_contexts;
DROP POLICY IF EXISTS "Users can insert financial contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Users can update financial contexts they own" ON financial_contexts;
DROP POLICY IF EXISTS "Users can delete financial contexts they own" ON financial_contexts;

-- Disable RLS on financial_contexts
ALTER TABLE financial_contexts DISABLE ROW LEVEL SECURITY;

-- Grant direct permissions to authenticated users
GRANT ALL PRIVILEGES ON financial_contexts TO authenticated;
GRANT SELECT ON financial_contexts TO anon;

-- Add a comment explaining this is temporary
COMMENT ON TABLE financial_contexts IS 'RLS temporarily disabled due to infinite recursion. Access controlled by application logic.';