import Footer from "@/components/Footer";
import Logo from "@/components/Logo";
import Navbar from "@/components/Navbar";
import { CircleCheck } from "lucide-react";

const AboutPage = () => {
  return (
    <div>
      <Navbar />
      <section className="w-full flex flex-col items-center justify-center min-h-[60vh]">
        <Logo height={300} width={300} />
        <p className="text-lg mb-6 text-center">
          This is an unofficial Formula One fan project. The goal is to build an
          clean and intuitive resource for F1 enthusiasts, powered by modern
          technologies like Next.js, React, and Tailwind CSS.
        </p>
        <ul className="mb-8 space-y-1 text-left">
          <li>
            <span className="inline-flex items-center gap-2">
              <CircleCheck />
              <span className="font-semibold">F1 Historical Statistics</span> —
              View driver/constructor information, race statistics, and
              telemetry data.
            </span>
          </li>
          <li>
            <span className="inline-flex items-center gap-2">
              <CircleCheck />
              <span className="font-semibold">
                Favorite Drivers and Teams
              </span>{" "}
              — Choose drivers and teams to follow. These drivers/teams will be shown to registered users by default.
            </span>
          </li>
          {/* <li>
            <span className="inline-flex items-center gap-2">
              <CircleCheck />
              <span className="font-semibold">Beautiful UI</span> — Enjoy a
              clean, responsive experience with light and dark modes.
            </span>
          </li> */}
        </ul>
        <span className="text-sm text-muted-foreground text-center">
          <strong>Note:</strong> This website is not affiliated with Formula One
          Management or the FIA.
        </span>
      </section>
      <Footer />
    </div>
  );
};

export default AboutPage;
