"use client";

import { Driver } from "@/types/driver";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface DriversContextType {
  driversData: Driver[];
}

const DriversContext = createContext<DriversContextType | undefined>(undefined);

export const useDrivers = (): DriversContextType => {
  const context = useContext(DriversContext);
  if (context === undefined) {
    throw new Error("useDrivers must be used within a DriversProvider");
  }
  return context;
};

interface DriversProviderProps {
  children: ReactNode;
}

export const DriversProvider: React.FC<DriversProviderProps> = ({
  children,
}) => {
  const [driversData, setDriversData] = useState<Driver[]>([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        // Fetch all driver details
        const driversRes = await fetch(`/api/drivers`);
        if (!driversRes.ok) {
          const details = await driversRes.json().catch(() => ({}));
          throw new Error(details?.error || "Failed to fetch drivers data");
        }
        const drivers = await driversRes.json();
        setDriversData(drivers);
      } catch (err) {
        console.error("Could not fetch drivers data: ", err);
        setDriversData([]);
      }
    };

    fetchDrivers();
  }, []);

  return (
    <DriversContext.Provider value={{ driversData }}>
      {children}
    </DriversContext.Provider>
  );
};
