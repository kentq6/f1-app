export type SessionResult = {
  position: number;
  driver_number: number;
  number_of_laps: number;
  points: number;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  gap_to_leader: number | string;
  duration: number;
  meeting_key: number;
  session_key: number;
};