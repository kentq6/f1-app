import { SessionResult } from "./sessionResult";

export interface DriverData extends SessionResult {
  name_acronym?: string;
  team_colour?: string;
  team_name?: string;
  headshot_url?: string;
}