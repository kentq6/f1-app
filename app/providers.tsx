"use client";

import { ThemeProvider } from "@/components/theme/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar/AppSidebar";
import { SessionFiltersProvider } from "./providers/SessionFiltersProvider";
import { FilteredSessionProvider } from "./providers/FilteredSessionProvider";
import { DriversProvider } from "./providers/DriversProvider";
import { SessionsProvider } from "./providers/SessionsProvider";
import QueryProvider from "./providers/QueryProvider";

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
                <SidebarProvider defaultOpen={false}>
                  <AppSidebar />
                  {children}
                </SidebarProvider>
              </QueryProvider>
            </DriversProvider>
          </SessionsProvider>
        </FilteredSessionProvider>
      </SessionFiltersProvider>
    </ThemeProvider>
  );
}
