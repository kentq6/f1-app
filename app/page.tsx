import Loading from "@/components/Loading";
import { redirect } from "next/navigation";

export default function HomePage() {
  // Next.js redirect first (recommended, server-side)
  redirect("/dashboard");
  return <Loading />
}
