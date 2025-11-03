import React from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Session } from "@/types/session";

interface SessionInfoProp {
  filteredSession: Session | null;
}

const SessionInfo = ({ filteredSession }: SessionInfoProp) => {
  return (
    <div>
      <h1 className="text-md font-bold pb-1">
        Session Info
      </h1>
      <Separator className="mb-1" />
      {filteredSession ? (
        <div className="mt-4 flex flex-col items-center justify-center h-full max-h-full">
          {/* Session Info */}
          <div className="flex flex-col items-center justify-center">
            <div className="font-semibold text-lg">
              {filteredSession.year} {filteredSession.country_name}
            </div>
            <div className="text-md opacity-80 mt-1">
              <span className="font-medium">Date: </span>
              {new Date(filteredSession.date_start).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="text-md opacity-80 mt-1">
              <span className="font-medium">Session Type:</span>{" "}
              {filteredSession.session_type}
            </div>
          </div>
          {/* Flag and Country Acronym */}
          <div className="flex flex-col items-center justify-center mt-4">
            <div className="w-[210px] h-[140px] rounded-md overflow-hidden shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-transform duration-200 hover:scale-105">
              <Image
                src={`/country-flags/${filteredSession.country_code}.svg`}
                width={210}
                height={140}
                alt={`${filteredSession.country_code} Flag`}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-xs font-medium mt-2 text-gray-700 dark:text-gray-300 tracking-wide">
              {filteredSession.country_code}
            </span>
          </div>
        </div>
      ) : (
        <div className="">Select a session to view information.</div>
      )}
    </div>
  );
};

export default SessionInfo;
