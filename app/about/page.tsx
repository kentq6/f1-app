import { CircleCheck } from "lucide-react";

const AboutPage = () => {
  return (
    <section className="w-full px-4 py-12 flex flex-col items-center justify-center min-h-[60vh] dark:bg-gray-800 dark:border-gray-700">
      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100 text-center">
        F1 Historical Stat Tracker
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 text-center">
        This is an unofficial Formula One fan project. My goal is to build a
        beautiful and fast resource for F1 enthusiasts, powered by modern
        technologies like Next.js, React, and Tailwind CSS.
      </p>
      <ul className="text-base text-gray-700 dark:text-gray-300 mb-8 space-y-1 text-left">
        <li>
          <span className="inline-flex items-center gap-2">
            <CircleCheck />
            <span className="font-semibold">Historical Statistics</span> — Track
            historical driver and constructor statistics.
          </span>
        </li>
        <li>
          <span className="inline-flex items-center gap-2">
            <CircleCheck />
            <span className="font-semibold">Favorite Drivers and Teams</span> —
            Choose drivers and teams to follow.
          </span>
        </li>
        <li>
          <span className="inline-flex items-center gap-2">
            <CircleCheck />
            <span className="font-semibold">Beautiful UI</span> — Enjoy a clean,
            responsive experience with light and dark modes.
          </span>
        </li>
      </ul>
      <span className="text-sm text-muted-foreground text-center">
        <strong>Note:</strong> This website is not affiliated with Formula One
        Management or the FIA.
      </span>
    </section>
  );
};

export default AboutPage;
