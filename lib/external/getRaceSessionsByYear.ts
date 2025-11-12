import axios from "axios";

export default async function getRaceSessionsByYear(year: number) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_OPENF1_BASE_URL}/sessions?year=${year}&session_type=Race`
    );
    return response.data;
  } catch (err) {
    console.error(`Error fetching sessions for year ${year}: `, err);
  }
}
