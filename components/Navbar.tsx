"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";
import Logo from "./Logo";
import React, { useState } from "react";
import SessionSelect from "./SessionSelect";
import { LogIn } from "lucide-react";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import DriverSelector from "./DriverSelector";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

const Navbar = () => {
  const { open } = useSidebar();

  // Get pathname for conditional rendering of SessionSelect and DriversSelect
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    // <header className="bg-primary-foreground border-b">
    <header>
      <nav>
        <div className="mx-auto px-2 pt-2">
          <div className="flex items-center justify-between h-10">
            {/* Left: Sidebar Toggle + Logo */}
            <div className="flex items-center">
              <SidebarTrigger />
              {/* Logo */}
              <Logo height={120} width={120} />
            </div>

            {/* Center: Search Functionality */}
            {pathname === "/dashboard" && !open && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="hidden md:flex items-center space-x-1 sm:space-x-2 xl:gap-2"
                >
                  <SessionSelect />

                  {/* Driver Selection Dropdown */}
                  <DriverSelector />
                </motion.div>
              </AnimatePresence>
            )}

            {/* Right: Auth and Toggle Light/Dark Mode Buttoms */}
            <div className="flex items-center space-x-1 sm:space-x-2 gap-2">
              {/* Theme Toggle */}
              <div>
                <ThemeToggle />
              </div>

              {/* Authentication - Desktop */}
              <div className="hidden md:block">
                <SignedOut>
                  <SignInButton>
                    <motion.button
                      whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(44, 62, 80, 0.25)" }}
                      whileTap={{ scale: 0.95 }}
                      className="relative overflow-hidden bg-formula-one-primary hover:bg-formula-one-primary/70 text-white px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-md transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative flex items-center gap-1">
                        <span>Sign In</span>
                        <LogIn size={18} />
                      </div>
                    </motion.button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <div className="flex items-center justify-center p-0.5 sm:p-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full border">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox:
                            "w-6 h-6 sm:w-8 sm:h-8 hover:scale-110 transition-transform duration-200",
                        },
                      }}
                    />
                  </div>
                </SignedIn>
              </div>

              {/* Mobile Menu Button */}
              <Button
                onClick={toggleMobileMenu}
                className="md:hidden p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:text-formula-one-primary transition-all duration-200 active:scale-95"
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
              </Button>
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
            <div className="px-2 pt-2 pb-3 space-y-1 rounded-xl mt-2 border bg-primary-foreground flex flex-col items-stretch">
              {/* Mobile Search Session & Driver Selector */}
              {pathname === "/dashboard" && !open && (
                <div className="flex items-center justify-center w-full max-w-xs self-center gap-2 md:gap-6">
                  <SessionSelect />

                  <DriverSelector />
                </div>
              )}

              {/* Mobile Authentication */}
              <div className="flex flex-col w-full">
                <Separator className="w-full my-2" />
                <SignedOut>
                  <SignInButton>
                    <button
                      className="w-full bg-formula-one-primary hover:bg-formula-one-primary/70 text-white px-3 py-2 rounded-md text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
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
                  <div className="flex items-center justify-center w-full p-3 rounded-xl">
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
    </header>
  );
};

export default Navbar;
