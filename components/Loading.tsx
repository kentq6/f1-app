"use client";

import React from 'react'
import { BlinkBlur } from 'react-loading-indicators';

const Loading = () => {
  return (
    <div className="flex flex-col items-center justify-center animate-fade-in pt-16">
      <BlinkBlur color="var(--color-formula-one-primary)" size="large" text="Loading..." textColor="black" />
    </div>
  );
}

export default Loading