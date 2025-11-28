"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Driver } from "@/types/driver";

interface DriversContextType {
  driversData: Driver[];
  setDriversData: (drivers: Driver[]) => void;
}

// Create the context
const DriversContext = createContext<DriversContextType | undefined>(undefined);

// Custom hook to use the context safely in descendants
export const useDriversData = (): DriversContextType => {
  const context = useContext(DriversContext);
  if (!context) {
    throw new Error("useDrivers must be used within a DriversProvider");
  }
  return context;
};

interface DriversProviderProps {
  children: ReactNode;
}

export const DriversProvider: React.FC<DriversProviderProps> = ({ children }) => {
  const [driversData, setDriversData] = useState<Driver[]>([]);

  const value: DriversContextType = {
    driversData,
    setDriversData,
  };

  return (
    <DriversContext.Provider value={value}>
      {children}
    </DriversContext.Provider>
  );
};