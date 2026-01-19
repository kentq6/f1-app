import { Driver } from "@/types/driver";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import React from "react";

type DriverRowProps = {
  driver: Driver;
  selectedDrivers: Driver[];
  handleToggle: (driver: Driver) => void;
};

const DriverRow = ({
  driver,
  selectedDrivers,
  handleToggle,
}: DriverRowProps) => {
  return (
    <div
      className="flex items-center gap-2 px-2 py-[5px] cursor-pointer rounded hover:bg-muted/80 transition-colors"
      onClick={(e) => {
        e.stopPropagation();
        handleToggle(driver);
      }}
    >
      <Checkbox
        id={`driver-select-${driver.driver_number}`}
        checked={selectedDrivers.some(
          (d) => d.driver_number === driver.driver_number
        )}
        className="h-4 w-4 border-gray-300 rounded accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
      />
      <Label className="text-xs">
        {driver.name_acronym
          ? `${driver.name_acronym} ${driver.driver_number}`
          : `Driver ${driver.driver_number}`}
      </Label>
    </div>
  );
};

export default React.memo(DriverRow);
