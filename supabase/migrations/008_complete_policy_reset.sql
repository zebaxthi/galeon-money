-- Eliminar TODAS las políticas RLS existentes de todas las tablas
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view contexts they own or are members of" ON public.financial_contexts;
DROP POLICY IF EXISTS "Context owners can update" ON public.financial_contexts;
DROP POLICY IF EXISTS "Users can create contexts" ON public.financial_contexts;
DROP POLICY IF EXISTS "Context owners can delete" ON public.financial_contexts;
DROP POLICY IF EXISTS "Users can view owned contexts" ON public.financial_contexts;

DROP POLICY IF EXISTS "Users can view members of their contexts" ON public.context_members;
DROP POLICY IF EXISTS "Context owners can manage members" ON public.context_members;
DROP POLICY IF EXISTS "Users can view members of owned contexts" ON public.context_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.context_members;
DROP POLICY IF EXISTS "Context owners can add members" ON public.context_members;
DROP POLICY IF EXISTS "Context owners can update members" ON public.context_members;
DROP POLICY IF EXISTS "Context owners can delete members" ON public.context_members;

DROP POLICY IF EXISTS "Users can view categories in their contexts" ON public.categories;
DROP POLICY IF EXISTS "Users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;

DROP POLICY IF EXISTS "Users can view movements in their contexts" ON public.movements;
DROP POLICY IF EXISTS "Users can insert movements" ON public.movements;
DROP POLICY IF EXISTS "Users can update own movements" ON public.movements;
DROP POLICY IF EXISTS "Users can delete own movements" ON public.movements;
DROP POLICY IF EXISTS "Users can view own movements" ON public.movements;

DROP POLICY IF EXISTS "Users can view budgets in their contexts" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update budgets in their contexts" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;

-- Recrear políticas simplificadas sin recursión

-- Políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para financial_contexts
CREATE POLICY "Users can view owned contexts" ON public.financial_contexts
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Context owners can update" ON public.financial_contexts
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can create contexts" ON public.financial_contexts
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Context owners can delete" ON public.financial_contexts
  FOR DELETE USING (auth.uid() = owner_id);

-- Políticas para context_members
CREATE POLICY "Users can view members of owned contexts" ON public.context_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.financial_contexts 
      WHERE id = context_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view own membership" ON public.context_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Context owners can manage members" ON public.context_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.financial_contexts 
      WHERE id = context_id AND owner_id = auth.uid()
    )
  );

-- Políticas para categories (simplificadas)
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para movements (simplificadas)
CREATE POLICY "Users can view own movements" ON public.movements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert movements" ON public.movements
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() = created_by);

CREATE POLICY "Users can update own movements" ON public.movements
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own movements" ON public.movements
  FOR DELETE USING (auth.uid() = created_by);

-- Políticas para budgets (simplificadas)
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);