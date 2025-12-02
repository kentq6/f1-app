import { Session } from "@/types/session";

export default async function fetchSessions(): Promise<Session[]> {
  const res = await fetch("/api/sessions");
  return res.json();
}
