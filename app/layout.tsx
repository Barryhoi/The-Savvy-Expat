import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Savvy Expat | Helping Expats Move To The Philippines",
  description:
    "Your one-stop solution for a seamless move to the Philippines. We handle every step of your move so you don't waste time, money, or energy figuring it out alone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        {/* Satoshi via Fontshare */}
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
