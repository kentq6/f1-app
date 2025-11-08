"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import Logo from "./Logo";
import React, { useState } from "react";
import { Session } from "@/types/session";
import SessionSelect from "./SessionSelect";
import { LogIn } from "lucide-react";
import { Separator } from "./ui/separator";

interface NavbarProps {
  selectedYear: number | "";
  selectedTrack: string;
  selectedSession: string;
  filteredSession: Session | null;
  yearOptions: number[];
  trackOptions: string[];
  sessionOptions: string[];
  onYearChange: (val: number | "") => void;
  onTrackChange: (val: string) => void;
  onSessionChange: (val: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  selectedYear,
  selectedTrack,
  selectedSession,
  yearOptions,
  trackOptions,
  sessionOptions,
  onYearChange,
  onTrackChange,
  onSessionChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    // Nav and Sidebar Trigger (if user is signed in)
    <nav className="sticky top-0 z-50">
      <div className="mx-auto px-2">
        <div className="flex items-center justify-between h-15">
          {/* Left: Sidebar Toggle + Logo */}
          <div className="flex items-center">
            <SignedIn>
              <SidebarTrigger />
            </SignedIn>
            {/* Logo */}
            <Logo height={150} width={150} />
          </div>

          {/* Center: Search Functionality */}
          <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
            <SessionSelect
              selectedYear={selectedYear}
              selectedTrack={selectedTrack}
              selectedSession={selectedSession}
              yearOptions={yearOptions}
              trackOptions={trackOptions}
              sessionOptions={sessionOptions}
              onYearChange={onYearChange}
              onTrackChange={onTrackChange}
              onSessionChange={onSessionChange}
            />
          </div>

          {/* Right: Auth and Toggle Light/Dark Mode Buttoms */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Theme Toggle */}
            <div className="mr-5">
              <ThemeToggle />
            </div>

            {/* Authentication - Desktop */}
            <div className="hidden md:block">
              <SignedOut>
                <SignInButton>
                  <button className="relative overflow-hidden bg-formula-one-primary hover:bg-formula-one-primary/70 text-white px-3 py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                    <div className="relative z-10 flex items-center gap-1">
                      <span>Sign In</span>
                      <LogIn size={18} />
                    </div>
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="p-0.5 sm:p-1 rounded-lg sm:rounded-xl bg-linear-to-r from-emerald-100/50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/20 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-700/30">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "w-6 h-6 sm:w-8 sm:h-8 hover:scale-110 transition-transform duration-200",
                        userButtonBox: "flex items-center justify-center",
                      },
                    }}
                  />
                </div>
              </SignedIn>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:text-formula-one-primary hover:bg-primary-foreground dark:hover:bg-primary-foreground transition-all duration-200 active:scale-95"
              aria-label="Toggle mobile menu"
            >
              <svg
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${
                  isMobileMenuOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen
              ? "max-h-96 opacity-100 pb-2 sm:pb-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 rounded-xl mt-2 border bg-primary-foreground border-border dark:border-border flex flex-col items-stretch">
            {/* Mobile Search Session */}
            <div className="flex items-center justify-center w-full max-w-xs self-center">
              <SessionSelect
                selectedYear={selectedYear}
                selectedTrack={selectedTrack}
                selectedSession={selectedSession}
                yearOptions={yearOptions}
                trackOptions={trackOptions}
                sessionOptions={sessionOptions}
                onYearChange={onYearChange}
                onTrackChange={onTrackChange}
                onSessionChange={onSessionChange}
              />
            </div>

            {/* Mobile Authentication */}
            <div className="flex flex-col w-full">
              <Separator className="w-full my-2" />
              <SignedOut>
                <SignInButton>
                  <button 
                    className="w-full bg-formula-one-primary hover:bg-formula-one-primary/70 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                    onClick={closeMobileMenu}
                  >
                    <div className="relative z-10 flex items-center gap-1">
                      <span>Sign In</span>
                      <LogIn size={18} />
                    </div>
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="flex items-center justify-center w-full p-3 rounded-xl bg-linear-to-r from-emerald-100/50 to-green-100/50 dark:from-emerald-900/20 dark:to-green-900/20 backdrop-blur-sm border border-emerald-200/30 dark:border-emerald-700/30">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "w-8 h-8 hover:scale-110 transition-transform duration-200",
                        userButtonBox: "flex items-center justify-center",
                      },
                    }}
                  />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
