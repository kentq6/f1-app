import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { useSessionInfo } from "@/app/providers/SessionInfoProvider";
import { useSelectedDrivers } from "@/app/providers/SelectedDriversProvider";
import { Driver } from "@/types/driver";
import DriverRow from "./DriverRow";
import { useCallback } from "react";

// Componentize driver row: Extract the driver row (Checkbox + Label) into a memoized child component to prevent unnecessary re-renders.
// To componentize the driver row and prevent unnecessary re-renders:
// Create a separate functional component (e.g., DriverRow) that renders the Checkbox and Label for a driver.
// Pass props for the driver object, whether it's selected, and the toggle handler.
// Wrap the component in React.memo to memoize it and avoid re-rendering unless its props change.
// This ensures each driver row only re-renders if its checked status or driver data changes.

const DriverSelector = () => {
  const { drivers } = useSessionInfo();
  const { selectedDrivers, setSelectedDrivers } = useSelectedDrivers();

  // Driver selection handlers
  const handleDriverToggle = useCallback((driver: Driver) => {
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
  }, [selectedDrivers, setSelectedDrivers]);

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
    <div className="flex items-center gap-2">
      <span className="hidden xl:block font-bold text-md">Drivers:</span>
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
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-formula-one-primary text-white px-2 py-1 text-xs font-medium shadow-sm transition-colors hover:bg-formula-one-primary/70 focus:outline-none focus:ring-1 focus:ring-offset-1"
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
            {drivers.map((driver) => (
              // <div
              //   key={`driver-select-${driver.driver_number}`}
              //   className="flex items-center gap-2 px-2 py-[5px] cursor-pointer rounded hover:bg-muted/80 transition-colors"
              //   onClick={(e) => {
              //     e.stopPropagation();
              //     handleDriverToggle(driver);
              //   }}
              // >
              //   <Checkbox
              //     id={`driver-select-${driver.driver_number}`}
              //     checked={selectedDrivers.some(
              //       (d) => d.driver_number === driver.driver_number
              //     )}
              //     className="h-4 w-4 border-gray-300 rounded accent-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
              //   />
              //   <Label className="text-xs">
              //     {driver.name_acronym
              //       ? `${driver.name_acronym} ${driver.driver_number}`
              //       : `Driver ${driver.driver_number}`}
              //   </Label>
              // </div>
              <DriverRow
                key={`driver-select-${driver.driver_number}`}
                driver={driver}
                selectedDrivers={selectedDrivers}
                handleDriverToggle={handleDriverToggle}
              />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DriverSelector;
