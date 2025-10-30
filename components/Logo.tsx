import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  height: number;
  width: number;
}

const Logo = ({ height, width }: LogoProps) => {
  const { theme } = useTheme();

  console.log(theme);

  // Conditionally choose which logo to render
  const logoSrc =
    theme === "dark"
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