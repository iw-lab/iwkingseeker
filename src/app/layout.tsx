import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { MotionVisibilityGuard } from "@/components/MotionVisibilityGuard";
import "./globals.css";

/**
 * 본문 서체 — 화면에 나오는 글자의 대부분이 여기서 나온다.
 *
 * 이전에는 제목뿐 아니라 **문제 본문까지** Black Han Sans(디스플레이 서체)로 찍었다.
 * 그 서체는 굵기가 400 하나뿐이라 굵기로 정보 위계를 만들 수 없고, 무엇보다
 * 수학·과학 문항에 흔한 글리프(½ ¾ × ÷ ㉠ ㉡ ℃ ㎠ …)를 갖고 있지 않아
 * 브라우저가 글자마다 다른 서체로 갈아 끼운다 — 전자칠판에서 "글씨가 깨져" 보이던
 * 실체가 이것이다. Noto Sans KR 은 이 글리프를 모두 갖고 있다.
 */
const notoSansKr = Noto_Sans_KR({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
});

/**
 * 제목도 **같은 가족**으로 간다 — 서체를 하나만 쓰고 굵기로 위계를 만든다.
 *
 * 전에는 제목에 디스플레이 서체(Black Han Sans)를 썼는데 문제가 둘이었다.
 *   ① 그 서체에는 ㉠ ㉡ ㎠ ㎡ ① Ⅱ ㎞ 같은 글리프가 없어 그 글자만 다른 서체로
 *      튀어 나왔다 — 화면에서 "글씨가 깨져" 보이던 실체다(2026-09-10 캔버스 실측).
 *   ② 굵기가 400 하나뿐이라 브라우저가 가짜 굵기(faux bold)를 그렸고,
 *      전자칠판처럼 큰 화면에서는 획이 뭉개져 오히려 읽기 나빠진다.
 *
 * Noto Sans KR 은 위 글리프를 전부 갖고 있고 굵기가 300~900까지 있다.
 * 그래서 제목 800 / 강조 700 / 본문 500 / 보조 400 네 단으로 위계를 만든다.
 */

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
      className={`${notoSansKr.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <MotionVisibilityGuard />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
