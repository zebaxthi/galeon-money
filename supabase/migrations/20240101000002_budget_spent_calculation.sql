-- Function to calculate and update budget spent amount based on movements
CREATE OR REPLACE FUNCTION update_budget_spent()
RETURNS TRIGGER AS $$
DECLARE
    budget_record RECORD;
    total_spent DECIMAL(12,2);
BEGIN
    -- Handle both INSERT, UPDATE and DELETE operations
    -- For DELETE, use OLD values, otherwise use NEW values
    DECLARE
        movement_category_id UUID;
        movement_context_id UUID;
        movement_amount DECIMAL(12,2);
        movement_type TEXT;
        movement_date DATE;
    BEGIN
        IF TG_OP = 'DELETE' THEN
            movement_category_id := OLD.category_id;
            movement_context_id := OLD.context_id;
            movement_amount := OLD.amount;
            movement_type := OLD.type;
            movement_date := OLD.movement_date::DATE;
        ELSE
            movement_category_id := NEW.category_id;
            movement_context_id := NEW.context_id;
            movement_amount := NEW.amount;
            movement_type := NEW.type;
            movement_date := NEW.movement_date::DATE;
        END IF;

        -- Only process expense movements with a category
        IF movement_type = 'expense' AND movement_category_id IS NOT NULL THEN
            -- Find all active budgets that match this movement's category and date range
            FOR budget_record IN
                SELECT id, context_id, start_date, end_date
                FROM budgets
                WHERE category_id = movement_category_id
                  AND is_active = true
                  AND start_date::DATE <= movement_date
                  AND end_date::DATE >= movement_date
                  AND (
                    (context_id IS NULL AND movement_context_id IS NULL) OR
                    (context_id = movement_context_id)
                  )
            LOOP
                -- Calculate total spent for this budget
                SELECT COALESCE(SUM(amount), 0)
                INTO total_spent
                FROM movements
                WHERE category_id = movement_category_id
                  AND type = 'expense'
                  AND movements.movement_date::DATE >= budget_record.start_date::DATE
                  AND movements.movement_date::DATE <= budget_record.end_date::DATE
                  AND (
                    (budget_record.context_id IS NULL AND context_id IS NULL) OR
                    (budget_record.context_id = context_id)
                  );

                -- Update the budget's spent amount
                UPDATE budgets
                SET spent = total_spent
                WHERE id = budget_record.id;
            END LOOP;
        END IF;
    END;

    -- Return appropriate record based on operation
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for movements table
DROP TRIGGER IF EXISTS budget_spent_update_trigger ON movements;
CREATE TRIGGER budget_spent_update_trigger
    AFTER INSERT OR UPDATE OR DELETE ON movements
    FOR EACH ROW
    EXECUTE FUNCTION update_budget_spent();

-- Function to recalculate all budget spent amounts (for maintenance)
CREATE OR REPLACE FUNCTION recalculate_all_budget_spent()
RETURNS void AS $$
DECLARE
    budget_record RECORD;
    total_spent DECIMAL(12,2);
BEGIN
    FOR budget_record IN
        SELECT id, category_id, context_id, start_date, end_date
        FROM budgets
        WHERE is_active = true
    LOOP
        -- Calculate total spent for this budget
        SELECT COALESCE(SUM(amount), 0)
        INTO total_spent
        FROM movements
        WHERE category_id = budget_record.category_id
          AND type = 'expense'
          AND movements.movement_date::DATE >= budget_record.start_date::DATE
          AND movements.movement_date::DATE <= budget_record.end_date::DATE
          AND (
            (budget_record.context_id IS NULL AND context_id IS NULL) OR
            (budget_record.context_id = context_id)
          );

        -- Update the budget's spent amount
        UPDATE budgets
        SET spent = total_spent
        WHERE id = budget_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Recalculate all existing budget spent amounts
SELECT recalculate_all_budget_spent();