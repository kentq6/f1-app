"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar/AppSidebar";
// import { DriversProvider } from "./providers/DriversProvider";
import { SessionsProvider } from "./providers/SessionsProvider";
import QueryProvider from "./providers/QueryProvider";
import { SessionInfoProvider } from "@/app/providers/SessionInfoProvider";
import { SelectedDriversProvider } from "@/app/providers/SelectedDriversProvider";
import { StoreProvider } from "@/store/storeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      // enableSystem
      disableTransitionOnChange
    >
      <StoreProvider>
        <SessionsProvider>
          {/* <DriversProvider> */}
            <QueryProvider>
              <SessionInfoProvider>
                <SelectedDriversProvider>
                  <SidebarProvider defaultOpen={false}>
                    <AppSidebar />
                    {children}
                  </SidebarProvider>
                </SelectedDriversProvider>
              </SessionInfoProvider>
            </QueryProvider>
          {/* </DriversProvider> */}
        </SessionsProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}
