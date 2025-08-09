-- Fix member data access for movements, budgets, and categories
-- Allow members to read and write data in contexts they belong to

-- Drop existing policies for movements
DROP POLICY IF EXISTS "Users can view their own movements" ON movements;
DROP POLICY IF EXISTS "Users can insert their own movements" ON movements;
DROP POLICY IF EXISTS "Users can update their own movements" ON movements;
DROP POLICY IF EXISTS "Users can delete their own movements" ON movements;

-- Create new policies for movements that include member access
CREATE POLICY "Users and members can view movements" ON movements
  FOR SELECT USING (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = movements.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

CREATE POLICY "Users and members can insert movements" ON movements
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = movements.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

CREATE POLICY "Users and members can update movements" ON movements
  FOR UPDATE USING (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = movements.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

CREATE POLICY "Users and members can delete movements" ON movements
  FOR DELETE USING (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = movements.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

-- Drop existing policies for budgets
DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

-- Create new policies for budgets that include member access
CREATE POLICY "Users and members can view budgets" ON budgets
  FOR SELECT USING (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = budgets.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

CREATE POLICY "Users and members can insert budgets" ON budgets
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = budgets.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

CREATE POLICY "Users and members can update budgets" ON budgets
  FOR UPDATE USING (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = budgets.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

CREATE POLICY "Users and members can delete budgets" ON budgets
  FOR DELETE USING (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = budgets.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

-- Drop existing policies for categories
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

-- Create new policies for categories that include member access
CREATE POLICY "Users and members can view categories" ON categories
  FOR SELECT USING (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = categories.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

CREATE POLICY "Users and members can insert categories" ON categories
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = categories.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

CREATE POLICY "Users and members can update categories" ON categories
  FOR UPDATE USING (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = categories.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

CREATE POLICY "Users and members can delete categories" ON categories
  FOR DELETE USING (
    user_id = auth.uid() OR
    (
      context_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM context_members cm
        WHERE cm.context_id = categories.context_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'member')
      )
    )
  );

-- Grant necessary permissions to authenticated users
GRANT ALL PRIVILEGES ON movements TO authenticated;
GRANT ALL PRIVILEGES ON budgets TO authenticated;
GRANT ALL PRIVILEGES ON categories TO authenticated;