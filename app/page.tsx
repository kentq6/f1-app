import Dashboard from "@/components/Dashboard";
import { headers } from "next/headers";
import { DriversProvider } from "./providers/DriversProvider";

export default async function HomePage() {
  // Get the base URL from headers or use a fallback
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;

  const [sessionsRes] = await Promise.all([
    fetch(`${baseUrl}/api/sessions`, { cache: "no-store" }),
  ]);

  const sessionsData = await sessionsRes.json();

  return (
    <DriversProvider>
      <Dashboard sessionsData={sessionsData} />
    </DriversProvider>
  );
}
