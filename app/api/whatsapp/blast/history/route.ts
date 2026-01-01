import { NextResponse } from "next/server";

const host = process.env.API_HOST || "localhost";
const port = process.env.API_PORT || "5000";
const BACKEND_URL = `http://${host}:${port}`;

export async function GET() {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/v1/whatsapp/blast/history`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch blast history" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blast history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
