import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeyAnna — The Terminal for Prediction Markets",
  description: "One screen. Every venue. Real-time flows, mispricings, and edge the crowd hasn't spotted yet. When the world shakes, our AI calls you.",
  keywords: ["prediction markets", "AI trading", "HeyAnna", "real-time signals", "market edge"],
  icons: {
    icon: "/heyannalogo.png",
    shortcut: "/heyannalogo.png",
    apple: "/heyannalogo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
