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
                key={`favorite-driver-select-${driver.last_name}`}
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
