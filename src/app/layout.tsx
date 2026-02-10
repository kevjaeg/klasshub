import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { Analytics } from "@/components/analytics";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://klasshub.app";

export const metadata: Metadata = {
  title: {
    default: "KlassHub – Alle Schul-Apps in einem Dashboard | WebUntis, Schulmanager & mehr",
    template: "%s | KlassHub",
  },
  description:
    "Stundenplan, Vertretungen, Noten – zentral für alle Kinder. Nie wieder zwischen 5 Apps wechseln. Kostenlos in der Beta. DSGVO-konform.",
  keywords: [
    "Schul-App", "Dashboard", "WebUntis", "Schulmanager", "IServ", "Moodle",
    "Stundenplan", "Vertretungsplan", "Eltern-App", "Schulplattform",
  ],
  authors: [{ name: "KlassHub" }],
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: SITE_URL,
    siteName: "KlassHub",
    title: "KlassHub – Alle Schul-Apps in einem Dashboard",
    description:
      "Stundenplan, Vertretungen, Noten – zentral für alle Kinder. Nie wieder zwischen 5 Apps wechseln.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KlassHub Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KlassHub – Alle Schul-Apps in einem Dashboard",
    description:
      "Stundenplan, Vertretungen, Noten – zentral für alle Kinder. Kostenlos in der Beta.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "KlassHub",
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
