import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = `${process.env.NEXT_PUBLIC_OPENF1_BASE_URL}`;
    const driversAPIUrl = `${baseUrl}/drivers`;
    const sessionsAPIUrl = `${baseUrl}/sessions`;

    // Fetch both upstream resources concurrently
    const [driversRes, sessionsRes] = await Promise.all([
      fetch(driversAPIUrl, {
        next: { revalidate: 86400 }, // cache 60s
      }),
      fetch(sessionsAPIUrl, {
        next: { revalidate: 86400 }, // cache 60s
      }),
    ]);

    if (!driversRes.ok || !sessionsRes.ok) {
      return NextResponse.json(
        {
          error: "Drivers or Sessions fetch failed",
          details: `drivers status ${driversRes.status}, sessions status ${sessionsRes.status}`,
        },
        { status: 500 }
      );
    }

    // Parse both responses as JSON
    const [drivers, sessions] = await Promise.all([
      driversRes.json(),
      sessionsRes.json(),
    ]);

    // Return a combined response as JSON
    return NextResponse.json({ drivers, sessions });
  } catch (err) {
    return NextResponse.json(
      { error: "Drivers and Sessions fetch failed", details: String(err) },
      { status: 500 }
    );
  }
}