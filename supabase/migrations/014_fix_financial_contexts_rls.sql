-- Verificar y corregir políticas RLS para financial_contexts
-- Los usuarios deben poder ver contextos donde son miembros

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view their own contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Users can view contexts they are members of" ON financial_contexts;
DROP POLICY IF EXISTS "Users can insert their own contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Users can update their own contexts" ON financial_contexts;
DROP POLICY IF EXISTS "Users can delete their own contexts" ON financial_contexts;

-- Crear nuevas políticas RLS para financial_contexts

-- Política de lectura: usuarios pueden ver contextos donde son miembros
CREATE POLICY "Users can view contexts they are members of" ON financial_contexts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM context_members cm
      WHERE cm.context_id = financial_contexts.id
      AND cm.user_id = auth.uid()
    )
  );

-- Política de inserción: solo usuarios autenticados pueden crear contextos
CREATE POLICY "Users can insert their own contexts" ON financial_contexts
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Política de actualización: solo propietarios pueden actualizar
CREATE POLICY "Users can update their own contexts" ON financial_contexts
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Política de eliminación: solo propietarios pueden eliminar
CREATE POLICY "Users can delete their own contexts" ON financial_contexts
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Verificar que RLS esté habilitado
ALTER TABLE financial_contexts ENABLE ROW LEVEL SECURITY;

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'financial_contexts';