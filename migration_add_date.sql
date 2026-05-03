-- 1. brain_dumps 테이블에 date 컬럼 추가
ALTER TABLE public.brain_dumps ADD COLUMN IF NOT EXISTS date TEXT;
UPDATE public.brain_dumps SET date = TO_CHAR(created_at, 'YYYY-MM-DD') WHERE date IS NULL;

-- 2. top_three 테이블에 date 컬럼 추가
ALTER TABLE public.top_three ADD COLUMN IF NOT EXISTS date TEXT;
UPDATE public.top_three SET date = TO_CHAR(created_at, 'YYYY-MM-DD') WHERE date IS NULL;

-- 3. time_blocks 테이블에 date 컬럼 추가
ALTER TABLE public.time_blocks ADD COLUMN IF NOT EXISTS date TEXT;
UPDATE public.time_blocks SET date = TO_CHAR(created_at, 'YYYY-MM-DD') WHERE date IS NULL;

-- 4. 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_brain_dumps_date ON public.brain_dumps(date);
CREATE INDEX IF NOT EXISTS idx_top_three_date ON public.top_three(date);
CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON public.time_blocks(date);
