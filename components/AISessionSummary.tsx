"use client";

import { useState, useEffect } from "react";
import { Driver } from "@/types/driver";
import { SessionResult } from "@/types/sessionResult";
import { Separator } from "./ui/separator";
import { StartingGrid } from "@/types/startingGrid";
import {
  AIInsight,
  SessionData,
  QualifyingSummary,
  SessionSummary,
} from "@/lib/ai";
import getSessionInsight from "@/app/actions/getSessionInsight";
import { ThreeDot } from "react-loading-indicators";
import { useFilteredSession } from "@/app/providers/FilteredSessionProvider";
// import { useDriversData } from "@/app/providers/DriversProvider";
import useClassificationInfo from "@/hooks/useClassificationInfo";

const AISessionSummary = () => {
  const { filteredSession } = useFilteredSession();
  // const { driversData } = useDriversData();
  const { drivers, classificationResults } = useClassificationInfo();

  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!filteredSession || drivers.length === 0) return;

    const fetchSessionSummary = async () => {
      setLoading(true);
      setInsight(null);

      try {
        // Build a Map for fast driver lookups
        const driversMap = new Map<number, Driver>(
          drivers.map((d) => [d.driver_number, d])
        );

        let resultsData: QualifyingSummary[] | SessionSummary[];
        if (filteredSession.session_type === "Qualifying") {
          // results is StartingGrid[] -> QualifyingSummary[]
          resultsData = (classificationResults?.data as StartingGrid[]).map((r) => {
            const driver = driversMap.get(r.driver_number);
            return {
              driver: driver?.name_acronym,
              team: driver?.team_name,
              position: r.position,
              lap_duration: r.lap_duration,
            } as QualifyingSummary;
          });
        } else {
          // results is SessionResult[] -> SessionSummary[]
          resultsData = (classificationResults?.data as SessionResult[]).map((r) => {
            const driver = driversMap.get(r.driver_number);
            return {
              driver: driver?.name_acronym,
              team: driver?.team_name,
              position: r.position,
              points: r.points,
              gap_to_leader: r.gap_to_leader,
            } as SessionSummary;
          });
        }

        const sessionData: SessionData = {
          session_name: filteredSession.session_name,
          track: filteredSession.circuit_short_name,
          type: filteredSession.session_type,
          results: resultsData,
        };

        setInsight(await getSessionInsight(sessionData));
      } catch (err) {
        console.error("Could not load session summary insights: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionSummary();
  }, [filteredSession, drivers, classificationResults?.data]);

  return (
    <div className="flex flex-col h-full flex-1 overflow-auto">
      <h1 className="text-sm font-bold pb-1">AI Session Summary</h1>
      <Separator />
      <div className="bg-background mt-2 p-4 rounded-sm sm:rounded-md border flex flex-col items-center justify-center flex-1 w-full gap-3">
        {loading ? (
          <ThreeDot
            color="var(--color-formula-one-primary)"
            size="medium"
            text="Analyzing..."
            textColor="gray"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 w-full">
            {insight?.title && (
              <div className="font-semibold text-base text-primary text-center">
                {insight.title}
              </div>
            )}
            {insight?.message && (
              <div className="text-sm text-muted-foreground text-center">
                {insight.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AISessionSummary;
