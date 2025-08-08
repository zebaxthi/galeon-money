-- Check and fix RLS policies for context_members table

-- First, let's see current policies
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
-- FROM pg_policies WHERE tablename = 'context_members';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own memberships" ON context_members;
DROP POLICY IF EXISTS "Users can insert their own memberships" ON context_members;
DROP POLICY IF EXISTS "Users can update their own memberships" ON context_members;
DROP POLICY IF EXISTS "Users can delete their own memberships" ON context_members;
DROP POLICY IF EXISTS "Context owners can manage members" ON context_members;

-- Create comprehensive RLS policies for context_members

-- Policy 1: Users can view memberships where they are involved (either as the member or as owner of the context)
CREATE POLICY "Users can view context memberships" ON context_members
  FOR SELECT
  USING (
    -- User can see their own memberships
    user_id = auth.uid()
    OR
    -- User can see memberships of contexts they own
    context_id IN (
      SELECT id FROM financial_contexts 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy 2: Context owners can insert new members
CREATE POLICY "Context owners can add members" ON context_members
  FOR INSERT
  WITH CHECK (
    context_id IN (
      SELECT id FROM financial_contexts 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy 3: Context owners can update member roles
CREATE POLICY "Context owners can update members" ON context_members
  FOR UPDATE
  USING (
    context_id IN (
      SELECT id FROM financial_contexts 
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    context_id IN (
      SELECT id FROM financial_contexts 
      WHERE owner_id = auth.uid()
    )
  );

-- Policy 4: Context owners can remove members, and users can remove themselves
CREATE POLICY "Users can manage their memberships" ON context_members
  FOR DELETE
  USING (
    -- Context owner can remove any member
    context_id IN (
      SELECT id FROM financial_contexts 
      WHERE owner_id = auth.uid()
    )
    OR
    -- Users can remove themselves from contexts
    user_id = auth.uid()
  );

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON context_members TO authenticated;

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies WHERE tablename = 'context_members';