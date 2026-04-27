-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS public.daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date TEXT NOT NULL,
  score INTEGER NOT NULL,
  completed_blocks INTEGER NOT NULL,
  total_blocks INTEGER NOT NULL,
  completed_tasks INTEGER NOT NULL,
  total_tasks INTEGER NOT NULL,
  assigned_top_three INTEGER NOT NULL,
  total_top_three INTEGER NOT NULL,
  planned_minutes INTEGER NOT NULL,
  completed_minutes INTEGER NOT NULL,
  completed_block_contents JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.brain_dumps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.top_three (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_assigned BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.time_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  task_id TEXT,
  content TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  color TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. RLS(보안) 기능 켜기
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_dumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.top_three ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_blocks ENABLE ROW LEVEL SECURITY;

-- 3. RLS(보안) 정책 세팅 (내 데이터만 읽고 쓰기)
-- Daily Logs
CREATE POLICY "Users can view own daily_logs" ON public.daily_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily_logs" ON public.daily_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily_logs" ON public.daily_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own daily_logs" ON public.daily_logs FOR DELETE USING (auth.uid() = user_id);

-- Brain Dumps
CREATE POLICY "Users can view own brain_dumps" ON public.brain_dumps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own brain_dumps" ON public.brain_dumps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own brain_dumps" ON public.brain_dumps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own brain_dumps" ON public.brain_dumps FOR DELETE USING (auth.uid() = user_id);

-- Top Three
CREATE POLICY "Users can view own top_three" ON public.top_three FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own top_three" ON public.top_three FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own top_three" ON public.top_three FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own top_three" ON public.top_three FOR DELETE USING (auth.uid() = user_id);

-- Time Blocks
CREATE POLICY "Users can view own time_blocks" ON public.time_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time_blocks" ON public.time_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time_blocks" ON public.time_blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own time_blocks" ON public.time_blocks FOR DELETE USING (auth.uid() = user_id);
