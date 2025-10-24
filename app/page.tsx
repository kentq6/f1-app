"use client";

import MockLayout from "../components/MockLayout";
import AppSidebar from "@/components/app-sidebar";
import Navbar from "@/components/NavBar";

export default function Home() {
  return (
    <div className="pt-6 h-screen">
      <AppSidebar />
      {/* Main content */}
      <MockLayout />
    </div>
  );
}
