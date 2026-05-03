-- 구글 OAuth 토큰 저장 테이블
-- Supabase SQL Editor에서 실행하세요.
--
-- Next.js API 라우트는 사용자 JWT 없이 이 테이블에 접근하므로,
-- 서버 환경변수 SUPABASE_SERVICE_ROLE_KEY 로만 google_tokens 를 읽고/씁니다.
-- (anon 키 + RLS(auth.uid()) 조합은 Route Handler에서 항상 거부됩니다.)

CREATE TABLE IF NOT EXISTS public.google_tokens (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS 보안 활성화
ALTER TABLE public.google_tokens ENABLE ROW LEVEL SECURITY;

-- 본인 데이터만 조회/수정 가능
CREATE POLICY "Users can view own google_tokens"
  ON public.google_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own google_tokens"
  ON public.google_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own google_tokens"
  ON public.google_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own google_tokens"
  ON public.google_tokens FOR DELETE
  USING (auth.uid() = user_id);
