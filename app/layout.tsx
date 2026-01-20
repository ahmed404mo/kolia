import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EasyAttend | نظام الحضور الذكي",
  description: "نظام تسجيل الحضور باستخدام QR Code والموقع الجغرافي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 👇 التعديل هنا: ضفنا suppressHydrationWarning
    <html lang="ar" dir="rtl" suppressHydrationWarning={true}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}