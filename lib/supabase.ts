import { createClient } from "@supabase/supabase-js";

// 환경 변수 설정 전까지는 에러를 방지하기 위해 빈 문자열로 처리하거나 예외 처리를 합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
