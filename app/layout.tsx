import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "네이버 플레이스 순위 검색기",
  description: "네이버 지도에서 플레이스의 검색 순위를 확인하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
