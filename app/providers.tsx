"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar/AppSidebar";
import { SessionFiltersProvider } from "./providers/SessionFiltersProvider";
import { FilteredSessionProvider } from "./providers/FilteredSessionProvider";
import { DriversProvider } from "./providers/DriversProvider";
import { SessionsProvider } from "./providers/SessionsProvider";
import QueryProvider from "./providers/QueryProvider";
import { SessionInfoProvider } from "@/app/providers/SessionInfoProvider";
import { SelectedDriversProvider } from "@/app/providers/SelectedDriversProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      // enableSystem
      disableTransitionOnChange
    >
      <SessionFiltersProvider>
        <FilteredSessionProvider>
          <SessionsProvider>
            <DriversProvider>
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
            </DriversProvider>
          </SessionsProvider>
        </FilteredSessionProvider>
      </SessionFiltersProvider>
    </ThemeProvider>
  );
}
