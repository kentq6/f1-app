"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LogoProps {
  height: number;
  width: number;
}

const Logo = ({ height, width }: LogoProps) => {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Avoid hydration mismatch by always rendering the default logo until mounted on client
  const logoSrc = !isMounted
    ? "/F1-logo-white.svg"
    : theme === "dark"
      ? "/F1-logo-white.svg"
      : "/F1-logo.svg";

  return (
    <Link href="/">
      <Image
        src={logoSrc}
        height={height}
        width={width}
        alt="F1 Logo"
        priority
      />
    </Link>
  );
};

export default Logo