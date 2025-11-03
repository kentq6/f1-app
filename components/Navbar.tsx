"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import Logo from "./Logo";
import React from "react";
import { Session } from "@/types/session";
import SessionSelectSmall from "./SessionSelect";
import { LogIn } from "lucide-react";

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
  return (
    // Nav and Side Bars
    <nav className="flex items-center justify-between sticky top-0 z-10 h-15">
      {/* Left: Sidebar Toggle + Logo */}
      <div className="flex items-center">
        <SignedIn>
          <SidebarTrigger />
        </SignedIn>
        {/* Logo */}
        <Logo height={150} width={150} />
      </div>

      {/* Center: Search Functionality */}
      <div className="flex-1 flex ml-30">
        <SessionSelectSmall
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
      <div className="flex items-center gap-2">
        <div className="mr-5">
          <ThemeToggle />
        </div>
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
    </nav>
  );
};

export default Navbar;
