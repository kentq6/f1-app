import Logo from "@/components/Logo";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex flex-row min-h-screen animate-fade-in duration-300">
      {/* Left side with logo */}
      <div className="flex flex-1 items-center justify-center p-8 border-r">
        <Logo height={500} width={500} />
      </div>

      {/* Right side with SignIn */}
      <div className="flex flex-1 items-center justify-center p-8 bg-primary-foreground">
        <div className="w-full max-w-md">
          <SignUp />
        </div>
      </div>
    </div>
  );
}
