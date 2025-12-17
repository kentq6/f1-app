"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Navbar from "./Navbar";

const UserProfile = () => {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded || !isSignedIn) {
    return null; // Or a loading indicator
  }

  // The primary email address
  const primaryEmail = user.primaryEmailAddress?.emailAddress;

  return (
    <main>
      <header className="pb-2 border-b-2 border-formula-one-primary shadow-2xl">
        <Navbar />
      </header>

      <div className="flex-1 grid grid-cols-1 gap-3 p-3 h-screen">
        {/* Profile Card */}
        <section className="h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center p-0.5 sm:p-1 w-8 h-8 sm:w-10 sm:h-10 rounded-full border">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "w-6 h-6 sm:w-8 sm:h-8 hover:scale-110 transition-transform duration-200",
                  },
                }}
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-formula-one-primary mb-1 tracking-tight">
              {user.fullName || user.firstName || "User"}
            </h2>
            <p className="text-sm text-muted-foreground mb-1">{primaryEmail}</p>
          </div>
        </section>

        {/* Favorite Drivers & Teams */}
        <section className="h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          {/* Favorite Drivers */}
          <h3 className="text-lg font-semibold text-formula-one-primary mb-2">
            Favorite Drivers
          </h3>
          {/* Mount a <FavoriteDriversSelector /> component here */}
          {/* TODO: Implement <FavoriteDriversSelector /> with backend integration */}
          <div className="flex flex-col gap-2">
            {/* Example placeholder for now */}
            <button className="bg-formula-one-primary text-white py-2 rounded-lg font-medium hover:bg-formula-one-primary/80 transition-all">
              Select Favorite Drivers
            </button>
            <p className="text-xs text-muted-foreground">
              Choose up to 3 of your favorite drivers.
            </p>
          </div>
        </section>

        <section className="col-span-1 md:col-span-2 h-full overflow-hidden bg-primary-foreground p-3 rounded-lg border">
          {/* Favorite Teams */}

          <h3 className="text-lg font-semibold text-formula-one-primary mb-2">
            Favorite Teams
          </h3>
          {/* Mount a <FavoriteTeamsSelector /> component here */}
          {/* TODO: Implement <FavoriteTeamsSelector /> with backend integration */}
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
    </main>
  );
};

export default UserProfile;
