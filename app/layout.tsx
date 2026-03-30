import type { Metadata } from "next";
import { Fraunces, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ls/ — Rút gọn link tức thì",
  description: "Rút gọn URL miễn phí, theo dõi lượt click, tạo QR code. Nhanh, gọn, không giới hạn.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${fraunces.variable} ${dmSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full"><Providers>{children}</Providers></body>
    </html>
  );
}
