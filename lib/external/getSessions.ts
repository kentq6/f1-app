import { Session } from "@/types/session";
import axios from "axios";

export default async function getSessions() {
  try {
    const response = await axios.get<Session[]>(
      `${process.env.NEXT_PUBLIC_OPENF1_BASE_URL}/sessions`
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching sessions data: ", err);
  }
}
