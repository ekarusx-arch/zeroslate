import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZeroSlate — 제로슬레이트",
  description:
    "브레인 덤프와 타임라인 드래그앤드롭으로 하루를 완벽하게 계획하세요. 뇌를 비우고 오직 현재에만 집중하는 스마트 플래너.",
  keywords: ["타임박싱", "플래너", "생산성", "일정관리", "ZeroSlate", "제로슬레이트"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
