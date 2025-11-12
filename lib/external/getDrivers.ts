import { Driver } from "@/types/driver";
import axios from "axios";

export default async function getDrivers() {
  try {
    const response = await axios.get<Driver[]>(
      `${process.env.NEXT_PUBLIC_OPENF1_BASE_URL}/drivers`
    );
    return response.data;
  } catch (err) {
    console.error("Error fetching drivers data: ", err);
  }
}
