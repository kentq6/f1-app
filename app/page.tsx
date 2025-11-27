import Dashboard from "@/components/Dashboard";
// import { headers } from "next/headers";
import { DriversProvider } from "./providers/DriversProvider";
import { SessionsProvider } from "./providers/SessionsProvider";

export default async function HomePage() {
  return (
    <DriversProvider>
      <SessionsProvider>
        <Dashboard />
      </SessionsProvider>
    </DriversProvider>
  );
}
