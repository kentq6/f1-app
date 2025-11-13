"use server";

import { generateSessionSummary, AIInsight, SessionData } from "@/lib/ai";

export default async function getAISessionSummary(sessionData: SessionData): Promise<AIInsight> {
  try {
    // Generate AI insights
    const insight = await generateSessionSummary(sessionData);
    return insight;
  } catch (error) {
    console.error("Error getting AI session summary insight: ", error);

    // Return fallback insights
    return {
      type: "warning",
      title: "Insight Temporarily Unavailable",
      message:
        "We're having trouble analyzing your session data right now. Please try again in a few minutes.",
      confidence: 0.5,
    };
  }
}
