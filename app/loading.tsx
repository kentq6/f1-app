"use client";

import { BlinkBlur } from "react-loading-indicators";

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in pt-16">
      <BlinkBlur
        color="var(--color-formula-one-primary)"
        size="large"
        text="Loading..."
        textColor="gray"
      />
    </div>
  );
}
