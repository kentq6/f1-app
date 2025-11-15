import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    // Forward all search parameters to the stints API
    const { searchParams } = new URL(request.url);

    // Construct the query string to append to the upstream API
    const queryString = searchParams.toString();
    let apiUrl = "https://api.openf1.org/v1/stints";
    if (queryString) {
      apiUrl += `?${queryString}`;
    }

    const res = await fetch(apiUrl, {
      next: { revalidate: 60 }, // cache 60s
    });

    if (!res.ok) throw new Error("Failed to fetch stints data");

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Stints fetch failed", details: String(err) }, { status: 500 });
  }
}
