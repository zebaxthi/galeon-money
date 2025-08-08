-- Temporarily disable RLS to test if that's the root cause of the issue
-- This is a diagnostic migration to isolate the problem

-- Disable RLS on both tables
ALTER TABLE financial_contexts DISABLE ROW LEVEL SECURITY;
ALTER TABLE context_members DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL PRIVILEGES ON financial_contexts TO authenticated;
GRANT ALL PRIVILEGES ON context_members TO authenticated;
GRANT ALL PRIVILEGES ON financial_contexts TO anon;
GRANT ALL PRIVILEGES ON context_members TO anon;

-- Drop all existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can view their contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Users can create contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Owners can update contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Owners can delete contexts" ON financial_contexts;

DROP POLICY IF EXISTS "Users can view memberships" ON context_members;
DROP POLICY IF EXISTS "Owners can add members" ON context_members;
DROP POLICY IF EXISTS "Owners can update members" ON context_members;
DROP POLICY IF EXISTS "Users can manage memberships" ON context_members;

-- Verify RLS is disabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('financial_contexts', 'context_members')
AND schemaname = 'public';