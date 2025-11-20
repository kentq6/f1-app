"use client";

import { Driver } from "@/types/driver";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface SelectedDrivers {
  selectedDrivers: Driver[] | [];
}

interface SelectedDriversContextType extends SelectedDrivers {
  setSelectedDrivers: (drivers: Driver[]) => void;
}

const SelectedDriversContext = createContext<SelectedDriversContextType | undefined>(undefined);

export const useSelectedDrivers = (): SelectedDriversContextType => {
  const context = useContext(SelectedDriversContext);
  if (context === undefined) {
    throw new Error("useSelectedDrivers must be used within a SelectedDriversProvider");
  }
  return context;
};

interface SelectedDriversProviderProps {
  children: ReactNode;
}

export const SelectedDriversProvider: React.FC<SelectedDriversProviderProps> = ({ children }) => {
  const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);

  const value: SelectedDriversContextType = {
    selectedDrivers,
    setSelectedDrivers,
  };

  return (
    <SelectedDriversContext.Provider value={value}>
      {children}
    </SelectedDriversContext.Provider>
  );
};
