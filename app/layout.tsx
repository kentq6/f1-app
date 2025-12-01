import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://f1-app-blond.vercel.app/"),
  title: "F1 Stats Dashboard",
  description:
    "An unofficial Formula 1 dashboard which tracks historical stats and performances.",
  authors: [{ name: "Kent Quach " }],
  creator: "Kent Quach",
  openGraph: {
    url: "https://f1-app-blond.vercel.app/",
    siteName: "F1 Stats Dashboard",
    images: [
      {
        url: "/F1-logo.svg",
        width: 1200,
        height: 630,
        alt: "F1 Stats Dashboard",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Providers>
            <main className="flex-1 overflow-x-hidden">
              <div className="w-full">{children}</div>
            </main>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
