// import { useTheme } from 'next-themes';
import React from 'react'
import { BlinkBlur } from 'react-loading-indicators';

const Loading = () => {
  // const { theme } = useTheme();

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in pt-16">
      <BlinkBlur 
        color="var(--color-formula-one-primary)"
        size="large" text="Loading..."
        textColor="gray"
      />
    </div>
  );
}

export default Loading