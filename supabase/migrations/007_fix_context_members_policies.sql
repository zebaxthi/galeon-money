 -- Eliminar las políticas problemáticas de context_members
DROP POLICY IF EXISTS "Users can view members of their contexts" ON public.context_members;
DROP POLICY IF EXISTS "Context owners can manage members" ON public.context_members;

-- Crear políticas RLS corregidas para context_members
-- Los usuarios pueden ver miembros de contextos que poseen
CREATE POLICY "Users can view members of owned contexts" ON public.context_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.financial_contexts 
      WHERE id = context_id AND owner_id = auth.uid()
    )
  );

-- Los usuarios pueden ver su propia membresía
CREATE POLICY "Users can view own membership" ON public.context_members
  FOR SELECT USING (user_id = auth.uid());

-- Solo los propietarios de contextos pueden insertar miembros
CREATE POLICY "Context owners can add members" ON public.context_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.financial_contexts 
      WHERE id = context_id AND owner_id = auth.uid()
    )
  );

-- Solo los propietarios de contextos pueden actualizar miembros
CREATE POLICY "Context owners can update members" ON public.context_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.financial_contexts 
      WHERE id = context_id AND owner_id = auth.uid()
    )
  );

-- Solo los propietarios de contextos pueden eliminar miembros
CREATE POLICY "Context owners can delete members" ON public.context_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.financial_contexts 
      WHERE id = context_id AND owner_id = auth.uid()
    )
  );