"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${origin}/auth/callback`,
          },
        });
        if (error) throw error;
        
        if (data?.user?.identities?.length === 0) {
          setError("이미 가입된 이메일입니다.");
        } else {
          setMessage("가입 확인 이메일이 발송되었습니다! 메일함을 확인해주세요.");
        }
      }
    } catch (err: unknown) {
      setError((err as Error).message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-sm">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-zinc-900">ZeroSlate</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isLogin ? "다시 오신 것을 환영합니다." : "새로운 시작을 준비하세요."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">이메일</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@zeroslate.app"
              required
              className="h-10"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700">비밀번호</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-10"
            />
          </div>

          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          {message && <p className="text-xs text-emerald-500 font-medium">{message}</p>}

          <Button
            type="submit"
            className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-white font-medium mt-2"
            disabled={loading}
          >
            {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-2"
          >
            {isLogin ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
          </button>
        </div>
      </div>
    </div>
  );
}
