import React from "react";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const SessionDetails = () => {
  const filteredSession = useSelector((state: RootState) => state.filteredSession.filteredSession);

  return (
    <div className="flex flex-col h-full">
      <h1 className="text-sm font-bold pb-1">Session Details</h1>
      <Separator />
      {filteredSession ? (
        <div className="bg-background mt-2 rounded-sm sm:rounded-md border flex flex-col items-center justify-center h-full w-full gap-3">
          {/* Session Info */}
          <div className="flex flex-col items-center">
            <div className="font-semibold text-lg text-center">
              {filteredSession.country_name}
            </div>
            <div className="text-sm lg:text-md opacity-80 text-center">
              {new Date(filteredSession.date_start).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </div>
          </div>

          {/* Flag and Country Acronym */}
          <div className="flex flex-col items-center overflow-hidden">
            <div className="w-24 h-16 md:w-48 md:h-32 lg:w-36 lg:h-24 xl:w-48 xl:h-36 rounded-md overflow-hidden border">
              <Image
                src={`/country-flags/${filteredSession.country_code}.svg`}
                width={100}
                height={60}
                alt={`${filteredSession.country_code} Flag`}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <span className="text-xs font-medium mt-2 tracking-wide">
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

export default SessionDetails;
