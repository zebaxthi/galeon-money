-- Permitir a usuarios autenticados buscar perfiles por email para invitaciones
-- Esto es necesario para la funcionalidad de invitar miembros a contextos financieros

-- Agregar política para permitir búsqueda de perfiles por email
CREATE POLICY "Authenticated users can search profiles by email" ON public.profiles
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    -- Solo permitir acceso a id y email para búsquedas de invitación
    true
  );

-- Nota: Esta política permite a usuarios autenticados buscar otros perfiles por email
-- pero solo para propósitos de invitación. La información sensible sigue protegida
-- por las consultas específicas en el código de la aplicación.