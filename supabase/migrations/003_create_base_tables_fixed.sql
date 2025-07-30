-- Fix existing schema conflicts and add missing functionality

-- First, let's ensure we have the correct structure for profiles
-- Add missing columns to profiles if they don't exist
DO $$
BEGIN
  -- Add name column if it doesn't exist (rename from full_name if needed)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'name') THEN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
      ALTER TABLE public.profiles RENAME COLUMN full_name TO name;
    ELSE
      ALTER TABLE public.profiles ADD COLUMN name TEXT;
    END IF;
  END IF;
  
  -- Add preferences column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'preferences') THEN
    ALTER TABLE public.profiles ADD COLUMN preferences JSONB DEFAULT '{}';
  END IF;
END $$;

-- Update categories table structure if needed
DO $$
BEGIN
  -- Add icon column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon') THEN
    ALTER TABLE public.categories ADD COLUMN icon TEXT;
  END IF;
  
  -- Add context_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'context_id') THEN
    ALTER TABLE public.categories ADD COLUMN context_id UUID REFERENCES public.financial_contexts(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Update movements table structure if needed
DO $$
BEGIN
  -- Add notes column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'notes') THEN
    ALTER TABLE public.movements ADD COLUMN notes TEXT;
  END IF;
  
  -- Rename date to movement_date if needed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'date') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'movement_date') THEN
    ALTER TABLE public.movements RENAME COLUMN date TO movement_date;
  END IF;
  
  -- Add movement_date if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'movement_date') THEN
    ALTER TABLE public.movements ADD COLUMN movement_date DATE NOT NULL DEFAULT CURRENT_DATE;
  END IF;
  
  -- Make description NOT NULL if it's nullable
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'movements' AND column_name = 'description' AND is_nullable = 'YES') THEN
    UPDATE public.movements SET description = 'Sin descripción' WHERE description IS NULL;
    ALTER TABLE public.movements ALTER COLUMN description SET NOT NULL;
  END IF;
END $$;

-- Update budgets table structure if needed
DO $$
BEGIN
  -- Add spent column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budgets' AND column_name = 'spent') THEN
    ALTER TABLE public.budgets ADD COLUMN spent DECIMAL(12,2) DEFAULT 0;
  END IF;
  
  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'budgets' AND column_name = 'is_active') THEN
    ALTER TABLE public.budgets ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
  
  -- Update period check constraint to include weekly
  ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_period_check;
  ALTER TABLE public.budgets ADD CONSTRAINT budgets_period_check CHECK (period IN ('weekly', 'monthly', 'yearly'));
END $$;

-- Create additional indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_categories_context_id ON public.categories(context_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON public.categories(type);
CREATE INDEX IF NOT EXISTS idx_movements_movement_date ON public.movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_movements_type ON public.movements(type);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON public.budgets(period);
CREATE INDEX IF NOT EXISTS idx_budgets_is_active ON public.budgets(is_active);

-- Update RLS policies for categories to include context access
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

CREATE POLICY "Users can view categories in their contexts" ON public.categories
  FOR SELECT USING (
    context_id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert categories in their contexts" ON public.categories
  FOR INSERT WITH CHECK (
    (context_id IN (
      SELECT context_id FROM public.context_members 
      WHERE user_id = auth.uid()
    ) OR user_id = auth.uid()) AND
    user_id = auth.uid()
  );

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (user_id = auth.uid());

-- Update the create_default_categories function
CREATE OR REPLACE FUNCTION public.create_default_categories(context_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Default income categories
  INSERT INTO public.categories (name, type, color, icon, user_id, context_id, is_default) VALUES
  ('Salario', 'income', '#10B981', 'Briefcase', user_id, context_id, true),
  ('Freelance', 'income', '#059669', 'Code', user_id, context_id, true),
  ('Inversiones', 'income', '#047857', 'TrendingUp', user_id, context_id, true),
  ('Otros Ingresos', 'income', '#065F46', 'Plus', user_id, context_id, true);
  
  -- Default expense categories
  INSERT INTO public.categories (name, type, color, icon, user_id, context_id, is_default) VALUES
  ('Alimentación', 'expense', '#EF4444', 'UtensilsCrossed', user_id, context_id, true),
  ('Transporte', 'expense', '#DC2626', 'Car', user_id, context_id, true),
  ('Vivienda', 'expense', '#B91C1C', 'Home', user_id, context_id, true),
  ('Servicios', 'expense', '#991B1B', 'Zap', user_id, context_id, true),
  ('Entretenimiento', 'expense', '#7F1D1D', 'Film', user_id, context_id, true),
  ('Salud', 'expense', '#F97316', 'Heart', user_id, context_id, true),
  ('Educación', 'expense', '#EA580C', 'GraduationCap', user_id, context_id, true),
  ('Compras', 'expense', '#C2410C', 'ShoppingBag', user_id, context_id, true),
  ('Otros Gastos', 'expense', '#9A3412', 'MoreHorizontal', user_id, context_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the create_default_context function to work with existing categories
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
  
  -- Update existing categories to belong to this context
  UPDATE public.categories 
  SET context_id = context_id 
  WHERE user_id = NEW.id AND context_id IS NULL;
  
  -- Create additional default categories if none exist
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE user_id = NEW.id) THEN
    PERFORM public.create_default_categories(context_id, NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to use 'name' instead of 'full_name'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;