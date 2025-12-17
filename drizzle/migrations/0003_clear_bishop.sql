ALTER TABLE "AISessionInsights" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "UserFavoriteDrivers" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "UserFavoriteTeams" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "Users" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;