import React, { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { useSessionInfo } from "@/app/providers/SessionInfoProvider";
import { useSelectedDrivers } from "@/app/providers/SelectedDriversProvider";
import { Driver } from "@/types/driver";
import { Label } from "./ui/label";

const DriverSelector = () => {
  const { drivers } = useSessionInfo();
  const { selectedDrivers, setSelectedDrivers } = useSelectedDrivers();

  // Select the first five drivers *only* on first mount (initial load), never again.
  // This ensures setSelectedDrivers only runs once, so user can clear selection indefinitely.
  const hasInitialized = React.useRef(false);
  useEffect(() => {
    if (!hasInitialized.current && drivers.length > 0 && selectedDrivers.length === 0) {
      setSelectedDrivers(drivers.slice(0, 5));
      hasInitialized.current = true;
    }
  }, [drivers, selectedDrivers.length, setSelectedDrivers]);

  // Driver selection handlers
  const handleDriverToggle = (driver: Driver) => {
    const isSelected = selectedDrivers.some(
      (d) => d.driver_number === driver.driver_number
    );
    if (isSelected) {
      // Remove driver if already selected
      setSelectedDrivers(
        selectedDrivers.filter((d) => d.driver_number !== driver.driver_number)
      );
    } else {
      // Add driver if not selected
      setSelectedDrivers([...selectedDrivers, driver]);
    }
  };

  const handleSelectAll = () => {
    // Avoid redundant updates if all drivers already selected
    if (selectedDrivers.length !== drivers.length) {
      setSelectedDrivers(drivers);
    }
  };

  const handleClearAll = () => {
    // Only clear if any drivers are selected
    if (selectedDrivers.length > 0) {
      setSelectedDrivers([]);
    }
  };

  return (
    // {/* Driver Selection Dropdown */}
    <Select>
      <SelectTrigger className="h-7 text-[11px]" aria-label="Select Drivers">
        <SelectValue placeholder="Drivers" />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 flex gap-2">
          {/* Select All Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleSelectAll();
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-primary text-primary-foreground px-2 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-offset-1"
            type="button"
          >
            Select All
          </Button>
          {/* Clear All Button */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleClearAll();
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-muted text-foreground px-2 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-muted/70 focus:outline-none focus:ring-1 focus:ring-offset-1"
            type="button"
          >
            Clear All
          </Button>
        </div>
        <SelectGroup>
          {drivers.map((driver, index) => (
            <div
              key={`driver-select-${index}`}
              className="flex items-center gap-2 px-2 py-[5px] cursor-pointer rounded hover:bg-muted/80 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleDriverToggle(driver);
              }}
            >
              <Checkbox
                id={`driver-select-${driver.driver_number}`}
                checked={selectedDrivers.some(
                  (d) => d.driver_number === driver.driver_number
                )}
                className="h-4 w-4 border-gray-300 rounded accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <Label className="text-xs font-medium text-foreground">
                {driver.name_acronym
                  ? `${driver.name_acronym} ${driver.driver_number}`
                  : `Driver ${driver.driver_number}`}
              </Label>
            </div>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default DriverSelector;
