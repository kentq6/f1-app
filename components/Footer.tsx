import Link from "next/link";
import { Computer, Github } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
  ];

  const socials = [
    { name: "Portfolio", href: "/", icon: Computer },
    { name: "Github", href: "/about", icon: Github },
  ];

  return (
    <footer className="mt-10 relative overflow-hidden border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Logo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo */}
          <Logo height={150} width={150} />

          {/* Navigation Links */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Quick Links
            </h3>
            <div className="flex flex-col space-y-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-gray-700 hover:text-[#6c47ff] dark:text-gray-200 dark:hover:text-[#6c47ff] transition-colors flex items-center h-full"
                  style={{ height: "100%" }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacts */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Socials
            </h3>
            <div className="flex flex-col space-y-3">
              {socials.map((social) => (
                <a
                  key={social.name}
                  target="_blank"
                  href={social.href}
                  rel="noopener noreferrer"
                  className="h-full"
                  style={{ height: "100%" }}
                >
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm">
                    <span className="text-white text-xs">
                      <social.icon color="#d1d5db" />
                    </span>
                    {social.name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-linear-to-r from-transparent via-gray-200 dark:via-formula-one-primary to-transparent mb-8"></div>

        {/* Copyright and Disclaimer */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} F1 Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
              Unofficial site, not affiliated with FOM/FIA.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
