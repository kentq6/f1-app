import axios from "axios";

export default async function getSessionResultsBySession(session_key: number) {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_OPENF1_BASE_URL}/session_result?session_key=${session_key}`
    );
    return response.data;
  } catch (err) {
    console.error(
      `Error fetching session results data for session ${session_key}: `,
      err
    );
  }
}
