import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "./analytics";

const description =
  "Fliggy 智能交互助手，将旅行需求转化为地图、行程、图表和可操作的工具。";

export const metadata: Metadata = {
  // Set the deployed site origin for absolute share-image URLs.
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: "Fliggy Intelligent UI",
  description,
  openGraph: { title: "Fliggy Intelligent UI", description, siteName: "Fliggy", type: "website" },
  twitter: { card: "summary_large_image", title: "Fliggy Intelligent UI", description },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
