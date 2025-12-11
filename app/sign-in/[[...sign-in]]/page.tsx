import Logo from "@/components/Logo";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex flex-col items-center p-5 gap-1 animate-fade-in min-h-screen justify-center bg-primary-foreground dark:bg-primary-foreground">
      <Logo height={150} width={150} />

      <div className="mt-1">
        <SignIn />
      </div>
    </main>
  );
}
