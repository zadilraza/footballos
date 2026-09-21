import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key is missing" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedDate = searchParams.get("date");

    const date =
      requestedDate || new Date().toISOString().split("T")[0];

    const response = await fetch(
      `https://v3.football.api-sports.io/fixtures?date=${date}`,
      {
        headers: {
          "x-apisports-key": apiKey,
        },
        next: {
          revalidate: 60,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch football data" },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Something went wrong",
        details: String(error),
      },
      { status: 500 }
    );
  }
}