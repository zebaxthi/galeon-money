-- Add updated_by field to movements table for complete audit trail
ALTER TABLE movements ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES profiles(id);

-- Create trigger to automatically update updated_at and updated_by on row updates
CREATE OR REPLACE FUNCTION update_movements_audit()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- Only update updated_by if it's provided in the update
    IF NEW.updated_by IS NOT NULL THEN
        NEW.updated_by = NEW.updated_by;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS movements_audit_trigger ON movements;
CREATE TRIGGER movements_audit_trigger
    BEFORE UPDATE ON movements
    FOR EACH ROW
    EXECUTE FUNCTION update_movements_audit();

-- Grant permissions
GRANT ALL PRIVILEGES ON movements TO authenticated;
GRANT SELECT ON movements TO anon;