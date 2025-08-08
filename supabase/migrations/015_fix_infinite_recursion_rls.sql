-- Fix infinite recursion in RLS policies between financial_contexts and context_members
-- The issue: financial_contexts policies check context_members, which in turn check financial_contexts
-- Solution: Use direct ownership checks and separate member access logic

-- First, drop ALL existing policies to start clean (comprehensive cleanup)
-- Drop all possible financial_contexts policies
DROP POLICY IF EXISTS "Users can view contexts they are members of" ON financial_contexts;
DROP POLICY IF EXISTS "Users can insert their own contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Users can update their own contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Users can delete their own contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Users can view their own contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Users can view owned contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Context owners can update" ON financial_contexts;
DROP POLICY IF EXISTS "Users can create contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Context owners can delete" ON financial_contexts;
DROP POLICY IF EXISTS "Users can view contexts they own or are members of" ON financial_contexts;
DROP POLICY IF EXISTS "Users can view contexts they belong to" ON financial_contexts;
DROP POLICY IF EXISTS "Users can view their contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Owners can update contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Owners can delete contexts" ON financial_contexts;

-- Drop all possible context_members policies
DROP POLICY IF EXISTS "Users can view context memberships" ON context_members;
DROP POLICY IF EXISTS "Context owners can add members" ON context_members;
DROP POLICY IF EXISTS "Context owners can update members" ON context_members;
DROP POLICY IF EXISTS "Users can manage their memberships" ON context_members;
DROP POLICY IF EXISTS "Users can view members of owned contexts" ON context_members;
DROP POLICY IF EXISTS "Users can view own membership" ON context_members;
DROP POLICY IF EXISTS "Context owners can manage members" ON context_members;
DROP POLICY IF EXISTS "Users can view members of their contexts" ON context_members;
DROP POLICY IF EXISTS "Users can view context members" ON context_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON context_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON context_members;
DROP POLICY IF EXISTS "Users can update their own memberships" ON context_members;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON context_members;
DROP POLICY IF EXISTS "Owners can add members" ON context_members;
DROP POLICY IF EXISTS "Owners can update members" ON context_members;
DROP POLICY IF EXISTS "Users can manage memberships" ON context_members;
DROP POLICY IF EXISTS "Users can view memberships" ON context_members;

-- Create simple, non-recursive policies for financial_contexts
-- Policy 1: Users can view contexts they own OR contexts where they are explicitly members
CREATE POLICY "Users can view their contexts" ON financial_contexts
  FOR SELECT
  USING (
    -- Direct ownership check (no recursion)
    owner_id = auth.uid()
    OR
    -- Direct membership check (no subquery to financial_contexts)
    id IN (
      SELECT cm.context_id 
      FROM context_members cm 
      WHERE cm.user_id = auth.uid()
    )
  );

-- Policy 2: Users can create contexts (they become owners)
CREATE POLICY "Users can create contexts" ON financial_contexts
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy 3: Only owners can update contexts
CREATE POLICY "Owners can update contexts" ON financial_contexts
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy 4: Only owners can delete contexts
CREATE POLICY "Owners can delete contexts" ON financial_contexts
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create simple, non-recursive policies for context_members
-- Policy 1: Users can view their own memberships and owners can view all memberships of their contexts
CREATE POLICY "Users can view memberships" ON context_members
  FOR SELECT
  USING (
    -- Users can see their own memberships
    user_id = auth.uid()
    OR
    -- Owners can see memberships of their contexts (direct ownership check)
    EXISTS (
      SELECT 1 FROM financial_contexts fc
      WHERE fc.id = context_members.context_id
      AND fc.owner_id = auth.uid()
    )
  );

-- Policy 2: Only context owners can add members
CREATE POLICY "Owners can add members" ON context_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM financial_contexts fc
      WHERE fc.id = context_members.context_id
      AND fc.owner_id = auth.uid()
    )
  );

-- Policy 3: Only context owners can update member roles
CREATE POLICY "Owners can update members" ON context_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM financial_contexts fc
      WHERE fc.id = context_members.context_id
      AND fc.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM financial_contexts fc
      WHERE fc.id = context_members.context_id
      AND fc.owner_id = auth.uid()
    )
  );

-- Policy 4: Owners can remove members, users can remove themselves
CREATE POLICY "Users can manage memberships" ON context_members
  FOR DELETE
  USING (
    -- Users can remove themselves
    user_id = auth.uid()
    OR
    -- Owners can remove any member from their contexts
    EXISTS (
      SELECT 1 FROM financial_contexts fc
      WHERE fc.id = context_members.context_id
      AND fc.owner_id = auth.uid()
    )
  );

-- Ensure RLS is enabled on both tables
ALTER TABLE financial_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE context_members ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON financial_contexts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON context_members TO authenticated;

-- Verify policies are created correctly
SELECT 'financial_contexts policies:' as info;
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'financial_contexts'
ORDER BY policyname;

SELECT 'context_members policies:' as info;
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'context_members'
ORDER BY policyname;