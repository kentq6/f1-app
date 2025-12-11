CREATE TABLE "user_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerkUserId" text NOT NULL,
	"favoriteDrivers" text[] DEFAULT '{}'::text[],
	"favoriteTeams" text[] DEFAULT '{}'::text[],
	CONSTRAINT "user_favorites_clerkUserId_unique" UNIQUE("clerkUserId")
);
--> statement-breakpoint
CREATE INDEX "clerkUserIdIndex" ON "user_favorites" USING btree ("clerkUserId");