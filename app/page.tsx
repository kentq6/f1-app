import Guest from "@/components/Guest";
import UserFavorites from "@/components/UserFavorites";
import { currentUser } from "@clerk/nextjs/server";

export default async function HomePage() {
  // Checks if user is logged in
  const user = await currentUser();
  
  // If user is not logged in, render Guest information
  if (!user) {
    return <Guest />;
  }

  // Return user favorittes along with latest session data
  return (
    <>
      <UserFavorites />
      <Guest />
    </>
  );
}
