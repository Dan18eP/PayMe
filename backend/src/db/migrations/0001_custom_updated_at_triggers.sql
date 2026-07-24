-- 0001_custom_updated_at_triggers.sql
-- Migración SQL custom para PostgreSQL / Supabase
-- Crea una función genérica y triggers para mantener updated_at automáticamente.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS debtors_set_updated_at ON debtors;
CREATE TRIGGER debtors_set_updated_at
BEFORE UPDATE ON debtors
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS payment_schedules_set_updated_at ON payment_schedules;
CREATE TRIGGER payment_schedules_set_updated_at
BEFORE UPDATE ON payment_schedules
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
