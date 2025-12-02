import { Driver } from "@/types/driver";

export default async function fetchDrivers(): Promise<Driver[]> {
  const res = await fetch("/api/drivers");
  return res.json();
}
