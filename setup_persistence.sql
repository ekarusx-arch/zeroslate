-- 1. 반복 루틴(routines) 테이블 생성
CREATE TABLE IF NOT EXISTS public.routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 사용자 설정(user_settings) 테이블 생성
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  start_time INTEGER DEFAULT 5,
  end_time INTEGER DEFAULT 24,
  step INTEGER DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS(보안) 기능 켜기
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 설정 (내 데이터만 읽고 쓰기)

-- Routines 정책
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own routines') THEN
    CREATE POLICY "Users can view own routines" ON public.routines FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own routines" ON public.routines FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own routines" ON public.routines FOR UPDATE USING (auth.uid() = user_id);
    CREATE POLICY "Users can delete own routines" ON public.routines FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- User Settings 정책
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own settings') THEN
    CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
    CREATE POLICY "Users can insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
    CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
