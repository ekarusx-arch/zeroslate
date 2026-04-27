ALTER TABLE public.daily_logs ADD COLUMN IF NOT EXISTS raw_data JSONB;
