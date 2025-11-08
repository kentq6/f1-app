import React from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Session } from "@/types/session";

interface SessionInfoProp {
  filteredSession: Session | null;
}

const SessionInfo = ({ filteredSession }: SessionInfoProp) => {
  return (
    <div className="flex flex-col h-full">
      <h1 className="text-md font-bold pb-1">Session Info</h1>
      <Separator className="mb-1" />
      {filteredSession ? (
        <div className="mt-4 flex flex-col items-center justify-center h-full max-h-full">
          
          {/* Session Info */}
          <div className="flex flex-col items-center justify-center">
            <div className="font-semibold text-md sm:text-lg">
              {filteredSession.year} {filteredSession.country_name}
            </div>
            <div className="ext-sm sm:text-md opacity-80 mt-1">
              <span>Date: </span>
              {new Date(filteredSession.date_start).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </div>
            <div className="ext-sm sm:text-md opacity-80 mt-1">
              <span>Session Type: </span>
              {filteredSession.session_type}
            </div>
          </div>
          
          {/* Flag and Country Acronym */}
          <div className="flex flex-col items-center justify-center mt-4">
            <div className="w-[120px] h-[80px] sm:w-[210px] sm:h-[140px] rounded-md overflow-hidden transition-transform duration-200 hover:scale-105">
              <Image
                src={`/country-flags/${filteredSession.country_code}.svg`}
                width={210}
                height={140}
                alt={`${filteredSession.country_code} Flag`}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <span className="text-xs font-medium mt-2 text-gray-700 dark:text-gray-300 tracking-wide">
              {filteredSession.country_code}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full font-medium text-center">
          <span>Select a session to view information.</span>
        </div>
      )}
    </div>
  );
};

export default SessionInfo;
