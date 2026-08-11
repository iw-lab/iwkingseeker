import type { Metadata } from "next";
import { Noto_Sans_KR, Black_Han_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { MotionVisibilityGuard } from "@/components/MotionVisibilityGuard";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
});

const blackHanSans = Black_Han_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "KingSeeker 킹시커 — 왕을 찾아라! 교실 퀴즈 배틀",
  description:
    "초등학교 교실에서 전자칠판으로 즐기는 팀 대항 퀴즈 게임. 숨겨진 왕을 찾아라! 2022 개정 교육과정 기반 문제 은행 제공.",
  keywords: [
    "교실 게임",
    "퀴즈 게임",
    "교육용 게임",
    "왕찾기",
    "팀 대항",
    "전자칠판",
    "초등 교육",
  ],
  openGraph: {
    title: "KingSeeker 킹시커",
    description: "왕을 찾아라! 교실 퀴즈 배틀",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} ${blackHanSans.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <MotionVisibilityGuard />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
