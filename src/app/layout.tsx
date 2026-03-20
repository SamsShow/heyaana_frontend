import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";
import { Providers } from "@/components/providers/Providers";
import { ToastProvider } from "@/components/dashboard/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.NEXT_PUBLIC_DEPLOYMENT_URL ? `https://${process.env.NEXT_PUBLIC_DEPLOYMENT_URL}` : null)
  || "https://beta.heyanna.trade";

const TITLE = "HeyAnna — The Terminal for Prediction Markets";
const DESCRIPTION =
  "Own the market before it owns you. We track the chaos — you take the position. Global data, cross-venue intelligence, and AI that's already ahead.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | HeyAnna",
  },
  description: DESCRIPTION,
  keywords: [
    "prediction markets",
    "AI trading",
    "HeyAnna",
    "real-time signals",
    "market edge",
    "polymarket",
    "copy trading",
    "whale alerts",
  ],
  authors: [{ name: "HeyAnna" }],
  creator: "HeyAnna",
  icons: {
    icon: "/heyannalogo.png",
    shortcut: "/heyannalogo.png",
    apple: "/heyannalogo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "HeyAnna",
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/heyannabanner.png",
        width: 1519,
        height: 581,
        alt: "HeyAnna — The Terminal for Prediction Markets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@heyanna_ai",
    images: ["/heyannabanner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        <Providers>
          <ThemeProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </ThemeProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
