import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex flex-col items-center p-5 gap-1 animate-fade-in min-h-screen justify-center bg-white dark:bg-gray-800">
      <Link href="/">         
        <Image
          src="/F1-unofficial-logo.svg"
          width={300}
          height={300}
          alt="Logo"
        />
      </Link>

      <div className="mt-1">
        <SignIn />
      </div>
    </main>
  );
}
