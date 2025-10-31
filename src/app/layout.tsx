import type { Metadata } from "next";
import { Baloo_2, Press_Start_2P } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import "./globals.css";

// 🍬 圆润可爱字体 - Baloo 2
const balooFont = Baloo_2({
  variable: "--font-pixel-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// 🎮 像素字体 - Press Start 2P
const pixelFont = Press_Start_2P({
  variable: "--font-pixel-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "HamQSL MailConfirm - QSL Card Mail Confirmation System",
  description: "Physical QSL Card Mail Confirmation System with HMAC-based token verification",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${balooFont.variable} ${pixelFont.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
