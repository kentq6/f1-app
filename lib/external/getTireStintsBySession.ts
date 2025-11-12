import axios from "axios";

export default async function getTireStintsBySession(session_key: number) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_OPENF1_BASE_URL}/stints?session_key=${session_key}`
    );
    return response.data;
  } catch (err) {
    console.log(`Error fetching tire stints data for session ${session_key}: `, err);
  }
}