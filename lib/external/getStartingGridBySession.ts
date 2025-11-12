import axios from "axios";

export default async function getStartingGridBySession(session_key: number) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_OPENF1_BASE_URL}/starting_grid?session_key=${session_key}`
    );
    return response.data;
  } catch (err) {
    console.error(
      `Error fetching starting grid data for session ${session_key}: `,
      err
    );
  }
}
