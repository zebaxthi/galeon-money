-- Create financial contexts table for shared finances
CREATE TABLE public.financial_contexts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create context members table for users in a financial context
CREATE TABLE public.context_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  context_id UUID REFERENCES public.financial_contexts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(context_id, user_id)
);

-- Modify movements table to include context and member info
ALTER TABLE public.movements 
ADD COLUMN context_id UUID REFERENCES public.financial_contexts(id) ON DELETE CASCADE,
ADD COLUMN created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Modify budgets table to include context
ALTER TABLE public.budgets 
ADD COLUMN context_id UUID REFERENCES public.financial_contexts(id) ON DELETE CASCADE;

-- Create indexes
CREATE INDEX idx_financial_contexts_owner_id ON public.financial_contexts(owner_id);
CREATE INDEX idx_context_members_context_id ON public.context_members(context_id);
CREATE INDEX idx_context_members_user_id ON public.context_members(user_id);
CREATE INDEX idx_movements_context_id ON public.movements(context_id);
CREATE INDEX idx_movements_created_by ON public.movements(created_by);
CREATE INDEX idx_budgets_context_id ON public.budgets(context_id);

-- Enable RLS
ALTER TABLE public.financial_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial contexts
CREATE POLICY "Users can view contexts they belong to" ON public.financial_contexts
  FOR SELECT USING (
    id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create contexts" ON public.financial_contexts
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Context owners can update" ON public.financial_contexts
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Context owners can delete" ON public.financial_contexts
  FOR DELETE USING (auth.uid() = owner_id);

-- RLS policies for context members
CREATE POLICY "Users can view context members" ON public.context_members
  FOR SELECT USING (
    context_id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Context owners can manage members" ON public.context_members
  FOR ALL USING (
    context_id IN (
      SELECT id FROM public.financial_contexts 
      WHERE owner_id = auth.uid()
    )
  );

-- Update movements policies to include context access
DROP POLICY "Users can view own movements" ON public.movements;
DROP POLICY "Users can insert own movements" ON public.movements;
DROP POLICY "Users can update own movements" ON public.movements;
DROP POLICY "Users can delete own movements" ON public.movements;

CREATE POLICY "Users can view movements in their contexts" ON public.movements
  FOR SELECT USING (
    context_id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert movements in their contexts" ON public.movements
  FOR INSERT WITH CHECK (
    (context_id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()) AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update own movements" ON public.movements
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own movements" ON public.movements
  FOR DELETE USING (created_by = auth.uid());

-- Update budgets policies
DROP POLICY "Users can view own budgets" ON public.budgets;
DROP POLICY "Users can insert own budgets" ON public.budgets;
DROP POLICY "Users can update own budgets" ON public.budgets;
DROP POLICY "Users can delete own budgets" ON public.budgets;

CREATE POLICY "Users can view budgets in their contexts" ON public.budgets
  FOR SELECT USING (
    context_id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert budgets in their contexts" ON public.budgets
  FOR INSERT WITH CHECK (
    context_id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can update budgets in their contexts" ON public.budgets
  FOR UPDATE USING (
    context_id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can delete budgets in their contexts" ON public.budgets
  FOR DELETE USING (
    context_id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

-- Function to create default personal context for new users
CREATE OR REPLACE FUNCTION public.create_default_context()
RETURNS TRIGGER AS $$
DECLARE
  context_id UUID;
BEGIN
  -- Create personal financial context
  INSERT INTO public.financial_contexts (name, description, owner_id)
  VALUES ('Finanzas Personales', 'Mi contexto financiero personal', NEW.id)
  RETURNING id INTO context_id;
  
  -- Add user as owner of the context
  INSERT INTO public.context_members (context_id, user_id, role)
  VALUES (context_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for default context creation
CREATE TRIGGER on_profile_create_context
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_context();

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_financial_contexts
  BEFORE UPDATE ON public.financial_contexts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();