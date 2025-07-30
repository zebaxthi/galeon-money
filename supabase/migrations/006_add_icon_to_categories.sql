-- Agregar columna icon a la tabla categories
ALTER TABLE public.categories 
ADD COLUMN icon TEXT DEFAULT '🏷️';

-- Actualizar categorías existentes con un icono por defecto si no tienen uno
UPDATE public.categories 
SET icon = '🏷️' 
WHERE icon IS NULL;