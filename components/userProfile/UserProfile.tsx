// "use client";

import Navbar from "../Navbar";
import Footer from "../Footer";
import { getFavoriteDrivers } from "@/app/actions/userFavorites";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import FavoriteDriversSelector from "./FavoriteDriversSelector";

export type FavoriteDrivers = {
  id: string;
  driverFullName: string;
  createdAt: Date;
}[] | undefined;

const UserProfile = async () => {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { favoriteDrivers }: { favoriteDrivers?: FavoriteDrivers } = await getFavoriteDrivers();

  return (
    <main className="lg:h-screen overflow-hidden flex flex-col">
      <header className="pb-2 border-b border-formula-one-primary shadow-2xl">
        <Navbar />
      </header>

      <div className="flex-1 grid grid-cols-2 gap-3 p-3 h-screen">
        {/* Profile Card */}
        <section className="col-span-2 h-full flex items-center justify-center bg-primary-foreground rounded-lg border">
          <div className="flex flex-col items-center justify-center gap-2">
            <Image
              src={user.imageUrl}
              width={80}
              height={80}
              alt={`${user.firstName}&#39;s profile`}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-white dark:border-gray-600 shadow-lg"
            />
            <h2 className="text-3xl font-bold text-formula-one-primary">
              {user.firstName || "User"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </section>

        {/* Favorite Drivers & Teams */}
        <section className="col-span-2 md:col-span-1 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          {/* Favorite Drivers */}
          <h3 className="text-lg font-semibold text-formula-one-primary mb-2">
            Favorite Drivers
          </h3>
          <div className="flex flex-col gap-2">
            <FavoriteDriversSelector favoriteDrivers={favoriteDrivers} />
            <p className="text-xs text-muted-foreground">
              Choose up to 3 of your favorite drivers.
            </p>
          </div>
        </section>

        {/* Favorite Teams */}
        <section className="col-span-2 md:col-span-1 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <h3 className="text-lg font-semibold text-formula-one-primary mb-2">
            Favorite Teams
          </h3>
          {/* Mount a <FavoriteTeamsSelector /> component here */}
          {/* <FavoriteTeamsSelector />  */}
          <div className="flex flex-col gap-2">
            {/* Example placeholder for now */}
            <button className="bg-formula-one-primary text-white py-2 rounded-lg font-medium hover:bg-formula-one-primary/80 transition-all">
              Select Favorite Teams
            </button>
            <p className="text-xs text-muted-foreground">
              Pick your favorite Formula 1 teams.
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
};

export default UserProfile;
