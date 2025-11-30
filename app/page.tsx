import { redirect } from "next/navigation";

export default async function HomePage() {
  // Next.js redirect first (recommended, server-side)
  redirect("/dashboard");
}
