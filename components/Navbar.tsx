"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import Logo from "./Logo";

const Navbar = () => {
  return (
    // Nav and Side Bars
    <nav className="px-4 flex items-center justify-between sticky top-0 z-10 bg-white border-b border-gray-100/50 dark:bg-gray-800 dark:border-gray-700/50 h-15 shadow-md border">
      {/* Left: Sidebar Toggle + Logo */}
      <div className="flex items-center">
        <SignedIn>
          <SidebarTrigger />
        </SignedIn>
        {/* Logo */}
        <Logo height={150} width={150} />
      </div>

      {/* Center: About Link */}
      {/* <div className="flex-1 flex items-center justify-center h-full">
        <Link
          href="/about"
          className="text-base font-medium text-gray-700 hover:text-[#6c47ff] dark:text-gray-200 dark:hover:text-[#6c47ff] transition-colors flex items-center h-full"
          style={{ height: "100%" }}
        >
          About
        </Link>
      </div> */}

      {/* Right: Auth and Toggle Light/Dark Mode Buttoms */}
      <div className="flex items-center gap-2">
        <div className="mr-5">
          <ThemeToggle />
        </div>
        <SignedOut>
          <SignInButton>
            <button className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
