import type { Metadata } from "next";
import { AppShell } from "@/components/SiteChrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "股票新手村",
  description: "A股行情、建议与复盘（仅供学习）",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
