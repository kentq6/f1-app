import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar/AppSidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "F1 Stats Dashboard",
  description: "A fan-made Formula 1 app which tracks lap times, pit stop efficiency, and driver performance across seasons.",
  openGraph: {
		url: 'https://kentquach.com',
		siteName: 'F1 Stats Dashboard',
		images: [
			{
				url: '/F1-logo.svg',
				width: 1200,
				height: 630,
				alt: 'F1 Stats Dashboard',
			},
		],
		locale: 'en_US',
		type: 'website',
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
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            // enableSystem
            disableTransitionOnChange
          >
            <div className="flex min-h-screen w-full overflow-hidden">
              <SidebarProvider defaultOpen>
                <SignedIn>
                  <AppSidebar />
                </SignedIn>
                <main className="flex-1 overflow-x-hidden">
                  {/* <Navbar /> */}
                  <div className="w-full">{children}</div>
                </main>
              </SidebarProvider>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
