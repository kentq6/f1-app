"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import Logo from "./Logo";
import React from "react";
import { Session } from "@/types/session";
import SessionSelectSmall from "./SessionSelect";

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
            <button className="px-5 py-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors font-semibold shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed">
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
