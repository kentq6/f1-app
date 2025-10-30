import Logo from "@/components/Logo";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex flex-col items-center p-5  gap-1 animate-fade-in min-h-screen justify-center bg-white dark:bg-gray-800">
      <Logo height={150} width={150} />

      <div className="mt-1">
        <SignUp />
      </div>
    </main>
  );
}
