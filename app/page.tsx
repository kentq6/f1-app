"use client";

import Image from "next/image";
// import NavBar from "./components/NavBar";
import SideBar from "../components/sidebar/SideBar";
import MockLayout from "../components/MockLayout";
// import StintData from "./components/StintData";
import { useState } from "react";
import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Home() {
  const [showSideBar, setShowSideBar] = useState(true);

  return (
    <>
      {/* Nav and Side Bars */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-20">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left: Sidebar Toggle + Logo */}
            <div className="flex items-center">
              
              {/* Logo */}
              <Link href="/">
                <Image
                  src="/F1-unofficial-logo.svg"
                  height={150}
                  width={150}
                  alt="F1 Logo"
                  className="ml-4"
                />
              </Link>
            </div>

            {/* Center: About Link */}
            <div className="flex-1 flex justify-center">
              <Link
                href="/about"
                className="text-base font-medium text-gray-700 hover:text-[#6c47ff] dark:text-gray-200 dark:hover:text-[#6c47ff] transition-colors"
              >
                About
              </Link>
            </div>

            {/* Right: Auth and Toggle Light/Dark Mode Buttoms */}
            <div className="flex items-center gap-2">
              <div className="mr-5">
                <ThemeToggle />
              </div>
              <SignedOut>
                <SignInButton>
                  <button className="cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="bg-[#6c47ff] text-ceramic-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Use pt-16 to add padding top to account for fixed nav bar (h-16 = 4rem = 64px) */}
      <div className="pt-16">
        {showSideBar && <SideBar />}
        {/* Main content */}
        <MockLayout />
      </div>
    </>
  );
}
