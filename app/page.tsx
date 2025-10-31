import Guest from "@/components/Guest";
// import UserFavorites from "@/components/UserFavorites";
// import { currentUser } from "@clerk/nextjs/server";

export default async function HomePage() {
  // Checks if user is logged in
  // const user = await currentUser();

  // Return user favorittes along with latest session data
  return (
    <>
      {/* {user && <UserFavorites />} */}
      <Guest />
    </>
  );
}
