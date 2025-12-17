CREATE TABLE "AISessionInsights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sessionKey" text NOT NULL,
	"aiType" text NOT NULL,
	"aiTitle" text NOT NULL,
	"aiMessage" text NOT NULL,
	"aiConfidence" text NOT NULL,
	"aiRaw" jsonb
);
--> statement-breakpoint
CREATE TABLE "UserFavoriteDrivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"driverId" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "UserFavoriteTeams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" uuid NOT NULL,
	"teamName" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "userFavorites" RENAME TO "Users";--> statement-breakpoint
ALTER TABLE "Users" DROP CONSTRAINT "userFavorites_clerkUserId_unique";--> statement-breakpoint
ALTER TABLE "UserFavoriteDrivers" ADD CONSTRAINT "UserFavoriteDrivers_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "UserFavoriteTeams" ADD CONSTRAINT "UserFavoriteTeams_userId_Users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."Users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessionKey_idx" ON "AISessionInsights" USING btree ("sessionKey");--> statement-breakpoint
CREATE INDEX "userFavoriteDrivers_userId_idx" ON "UserFavoriteDrivers" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "userFavoriteTeams_userId_idx" ON "UserFavoriteTeams" USING btree ("userId");--> statement-breakpoint
ALTER TABLE "Users" DROP COLUMN "favoriteDrivers";--> statement-breakpoint
ALTER TABLE "Users" DROP COLUMN "favoriteTeams";--> statement-breakpoint
ALTER TABLE "Users" ADD CONSTRAINT "Users_clerkUserId_unique" UNIQUE("clerkUserId");