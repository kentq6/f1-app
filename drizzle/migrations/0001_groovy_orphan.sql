ALTER TABLE "user_favorites" RENAME TO "userFavorites";--> statement-breakpoint
ALTER TABLE "userFavorites" DROP CONSTRAINT "user_favorites_clerkUserId_unique";--> statement-breakpoint
ALTER TABLE "userFavorites" ADD CONSTRAINT "userFavorites_clerkUserId_unique" UNIQUE("clerkUserId");