import { SessionResult } from "./sessionResult";
import { StartingGrid } from "./startingGrid";

export interface DriverData extends SessionResult, StartingGrid {
  name_acronym?: string;
  team_colour?: string;
  team_name?: string;
  headshot_url?: string;
}