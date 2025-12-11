import { BlinkBlur } from "react-loading-indicators";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in min-h-screen min-w-full">
      <BlinkBlur
        color="var(--color-formula-one-primary)"
        size="large"
        text="Loading..."
        textColor="gray"
      />
    </div>
  );
}
