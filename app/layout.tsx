import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth/AuthProvider";
import CssRecovery from "@/components/CssRecovery";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ZeroSlate",
    startupImage: [
      "/icon-512.png",
    ],
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="zeroslate-css-pending" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html.zeroslate-css-pending body {
                opacity: 0;
                animation: zeroslate-reveal-fallback 0s linear 1.2s forwards;
              }
              html.zeroslate-css-ready body {
                opacity: 1;
                transition: opacity 120ms ease;
              }
              @keyframes zeroslate-reveal-fallback {
                to {
                  opacity: 1;
                }
              }
            `,
          }}
        />
        <meta name="theme-color" content="#2563EB" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <CssRecovery />
        <AuthProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AuthProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
