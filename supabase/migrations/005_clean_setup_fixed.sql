-- Limpiar todo y empezar desde cero
-- IMPORTANTE: Este script eliminará todos los datos existentes

-- Eliminar todos los triggers existentes (incluyendo los de financial_contexts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_categories ON public.categories;
DROP TRIGGER IF EXISTS handle_updated_at_movements ON public.movements;
DROP TRIGGER IF EXISTS handle_updated_at_budgets ON public.budgets;
DROP TRIGGER IF EXISTS handle_updated_at_financial_contexts ON public.financial_contexts;

-- Eliminar tablas en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS public.context_members CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.movements CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.financial_contexts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Eliminar funciones con CASCADE para eliminar dependencias
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_categories() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_context() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de perfiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de contextos financieros
CREATE TABLE public.financial_contexts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de miembros de contexto
CREATE TABLE public.context_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  context_id UUID REFERENCES public.financial_contexts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')) DEFAULT 'member',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(context_id, user_id)
);

-- Crear tabla de categorías
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  context_id UUID REFERENCES public.financial_contexts(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de movimientos
CREATE TABLE public.movements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  context_id UUID REFERENCES public.financial_contexts(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de presupuestos
CREATE TABLE public.budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  spent DECIMAL(12,2) DEFAULT 0,
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')) DEFAULT 'monthly',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  context_id UUID REFERENCES public.financial_contexts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_financial_contexts_owner_id ON public.financial_contexts(owner_id);
CREATE INDEX idx_context_members_context_id ON public.context_members(context_id);
CREATE INDEX idx_context_members_user_id ON public.context_members(user_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_context_id ON public.categories(context_id);
CREATE INDEX idx_movements_user_id ON public.movements(user_id);
CREATE INDEX idx_movements_context_id ON public.movements(context_id);
CREATE INDEX idx_movements_movement_date ON public.movements(movement_date);
CREATE INDEX idx_movements_category_id ON public.movements(category_id);
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_context_id ON public.budgets(context_id);
CREATE INDEX idx_budgets_category_id ON public.budgets(category_id);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para financial_contexts
CREATE POLICY "Users can view contexts they own or are members of" ON public.financial_contexts
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM public.context_members 
      WHERE context_id = id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Context owners can update" ON public.financial_contexts
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can create contexts" ON public.financial_contexts
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Context owners can delete" ON public.financial_contexts
  FOR DELETE USING (auth.uid() = owner_id);

-- Políticas RLS para context_members
CREATE POLICY "Users can view members of their contexts" ON public.context_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.financial_contexts 
      WHERE id = context_id AND (owner_id = auth.uid() OR id IN (
        SELECT context_id FROM public.context_members WHERE user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Context owners can manage members" ON public.context_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.financial_contexts 
      WHERE id = context_id AND owner_id = auth.uid()
    )
  );

-- Políticas RLS para categories
CREATE POLICY "Users can view categories in their contexts" ON public.categories
  FOR SELECT USING (
    auth.uid() = user_id OR
    (context_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.context_members 
      WHERE context_id = categories.context_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para movements
CREATE POLICY "Users can view movements in their contexts" ON public.movements
  FOR SELECT USING (
    auth.uid() = user_id OR
    (context_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.context_members 
      WHERE context_id = movements.context_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert movements" ON public.movements
  FOR INSERT WITH CHECK (auth.uid() = user_id AND auth.uid() = created_by);

CREATE POLICY "Users can update own movements" ON public.movements
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own movements" ON public.movements
  FOR DELETE USING (auth.uid() = created_by);

-- Políticas RLS para budgets
CREATE POLICY "Users can view budgets in their contexts" ON public.budgets
  FOR SELECT USING (
    auth.uid() = user_id OR
    (context_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.context_members 
      WHERE context_id = budgets.context_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update budgets in their contexts" ON public.budgets
  FOR UPDATE USING (
    auth.uid() = user_id OR
    (context_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.context_members 
      WHERE context_id = budgets.context_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Función para manejar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para crear perfil de nuevo usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear contexto personal por defecto
CREATE OR REPLACE FUNCTION public.create_default_context()
RETURNS TRIGGER AS $$
DECLARE
  context_id UUID;
BEGIN
  -- Crear contexto personal por defecto
  INSERT INTO public.financial_contexts (name, description, owner_id)
  VALUES ('Personal', 'Contexto financiero personal', NEW.id)
  RETURNING id INTO context_id;
  
  -- Agregar al usuario como miembro del contexto
  INSERT INTO public.context_members (context_id, user_id, role)
  VALUES (context_id, NEW.id, 'owner');
  
  -- Crear categorías por defecto para este contexto
  INSERT INTO public.categories (name, color, type, user_id, context_id, is_default) VALUES
    ('Alimentación', '#EF4444', 'expense', NEW.id, context_id, true),
    ('Transporte', '#F97316', 'expense', NEW.id, context_id, true),
    ('Servicios', '#EAB308', 'expense', NEW.id, context_id, true),
    ('Entretenimiento', '#8B5CF6', 'expense', NEW.id, context_id, true),
    ('Salud', '#EC4899', 'expense', NEW.id, context_id, true),
    ('Educación', '#06B6D4', 'expense', NEW.id, context_id, true),
    ('Compras', '#10B981', 'expense', NEW.id, context_id, true),
    ('Otros Gastos', '#6B7280', 'expense', NEW.id, context_id, true),
    ('Salario', '#22C55E', 'income', NEW.id, context_id, true),
    ('Freelance', '#3B82F6', 'income', NEW.id, context_id, true),
    ('Inversiones', '#8B5CF6', 'income', NEW.id, context_id, true),
    ('Otros Ingresos', '#10B981', 'income', NEW.id, context_id, true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_default_context();

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_financial_contexts
  BEFORE UPDATE ON public.financial_contexts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_categories
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_movements
  BEFORE UPDATE ON public.movements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_budgets
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();