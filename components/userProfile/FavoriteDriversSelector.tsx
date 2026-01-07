import {
  Select,
  SelectContent,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useChampionshipInfo } from "@/hooks/useChampionshipInfo";
import { FavoriteDrivers } from "./UserProfile";
import FavoriteDriversRow from "./FavoriteDriversRow";

type FavoriteDriversSelectorProps = {
  favoriteDrivers: FavoriteDrivers;
}

const FavoriteDriversSelector = ({ favoriteDrivers }: FavoriteDriversSelectorProps) => {
  const { driversStandings } = useChampionshipInfo();

  // Favorite driver selection handler
  // You should not use React Hooks like useCallback in an async component (such as a Server Component). Move the handler to a Client Component and call your async logic (e.g., API route or server action) from there. Server Components cannot have hooks; only Client Components can.
  

  return (
    <div>
      <Select>
        <SelectTrigger className="h-7 text-[11px]" aria-label="Select Drivers">
          <SelectValue placeholder="Drivers" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {driversStandings.map((driver) => (
              <FavoriteDriversRow
                key={`favorite-driver-select-${driver.driver_number}`}
                driver={driver}
                favoriteDrivers={favoriteDrivers}
              />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FavoriteDriversSelector;
