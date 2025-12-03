import { ClassificationResult } from "@/app/providers/SessionInfoProvider";
import { useEffect, useState } from "react";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
import { useDriversData } from "@/app/providers/DriversProvider";
import { useQuery } from "@tanstack/react-query";
import { Driver } from "@/types/driver";

export default function useSessionInfo() {
  const { filteredSession } = useFilteredSession();
  const { driversData } = useDriversData();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [classificationResults, setClassificationResults] =
    useState<ClassificationResult | null>(null);

  const isQuali = filteredSession?.session_type === "Qualifying";

  const { data: classificationResultData } = useQuery({
    queryKey: ["classificationResult", filteredSession?.session_key],
    queryFn: async () => {
      if (!filteredSession) return null;
      let res;
      if (isQuali) {
        res = await fetch(
          `/api/starting_grid?session_key=${filteredSession.session_key}`
        );
      } else {
        res = await fetch(
          `/api/session_result?session_key=${filteredSession.session_key}`
        );
      }
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(
          error?.error || "Failed to fetch classification results"
        );
      }

      return await res.json();
    },
  });

  useEffect(() => {
    // If there's no session or no drivers data, reset and do nothing
    if (!filteredSession || driversData.length === 0) {
      setDrivers([]);
      setClassificationResults(null);
      return;
    }

    try {
      if (
        !Array.isArray(classificationResultData) ||
        !classificationResultData[0]?.session_key
      ) {
        throw new Error("Session data missing or unexpected format");
      }

      // Set the discriminated union here
      setClassificationResults(
        isQuali
          ? { type: "grid", data: classificationResultData }
          : { type: "result", data: classificationResultData }
      );

      // Fetch driver details for the session
      const driversDataList = driversData
        .filter(
          (drivers) => drivers.session_key === filteredSession.session_key
        )
        .sort((a, b) => a.driver_number - b.driver_number);

      setDrivers(driversDataList);
    } catch (err) {
      console.error("Could not load session driver list: ", err);
      setDrivers([]); // fallback to empty on error
      setClassificationResults(null); // and empty session results
    }
  }, [filteredSession, driversData, classificationResultData, isQuali]);

  return { drivers, classificationResults };
}
