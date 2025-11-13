import OpenAI from "openai";

// interface RawInsight {
//   type?: string;
//   title?: string;
//   message?: string;
//   confidence?: number;
// }

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "F1 Dashboard",
  },
});

// Session "summary" input type as used in getAISessionSummary in @file_context_1
export interface SessionData {
  session_name: string;
  track: string;
  type: string;
  results: QualifyingSummary[] | SessionSummary[];
}

export interface QualifyingSummary {
  driver: string | undefined;
  team: string | undefined;
  position: number;
  lap_duration: number;
}

export interface SessionSummary {
  driver: string | undefined;
  team: string | undefined;
  position: number;
  points: number;
  gap_to_leader: number;
}

export interface AIInsight {
  type: "warning" | "info" | "success";
  title: string;
  message: string;
  confidence: number;
}

export async function generateSessionSummary(
  sessionData: SessionData
): Promise<AIInsight> {
  try {
    const prompt = `Analyze the following session data and provide a clear and concise 4-5 sentence insight summarizing the events of the session. 
    Return a JSON insight with this structure:
    {
      "type": "warning|info|success",
      "title": "Brief title",
      "message": "Detailed insight message with specific numbers when possible",
      "confidence": 0.8
    }

    Session Data:
    ${JSON.stringify(sessionData, null, 2)}

    Focus on:
    1. Session location (track) and session type (e.g., Qualifying, Race) as context for the summary.
    2. Top three results: Highlight the drivers, teams, and positions of the podium finishers, referencing their names and positions explicitly. Include lap times or points if available.
    3. Identify any surprising or shocking results: This could be unexpected performances, big position changes, underdog podiums, DNFs (Did Not Finish) for favorites, or unusual events.
    4. Note any performance trends, close battles, or significant gaps among the top finishers.
    5. Mention anything that stands out such as record-breaking achievements, debut performances, or strategic gambles.

    Return only valid JSON array, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content:
            "You are a Formula One AI that analyzes the results of a given session and provides actionable insights. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("No response from AI");
    }

    // Clean the response by removing markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```json")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "");
    }

    // Parse AI response
    const insight = JSON.parse(cleanedResponse);

    // Ensure proper format
    const formattedInsight = {
      type: insight.type || "info",
      title: insight.title || "AI Insight",
      message: insight.message || "Analysis complete",
      confidence: insight.confidence || 0.8,
    };

    return formattedInsight;
  } catch (error) {
    console.error("❌ Error generating AI insight:", error);

    // Fallback to mock insights if AI fails
    return {
      type: "info",
      title: "AI Analysis Unavailable",
      message:
        "Unable to generate insight at this time. Please try again later.",
      confidence: 0.5,
    };
  }
}
