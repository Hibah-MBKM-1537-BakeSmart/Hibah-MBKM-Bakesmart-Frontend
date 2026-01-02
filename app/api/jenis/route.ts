import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// GET all jenis
export async function GET() {
  try {
    console.log(`[Jenis API] GET all jenis from: ${BACKEND_URL}/jenis`);

    const response = await fetch(`${BACKEND_URL}/jenis`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Jenis API] Retrieved ${data.data?.length || 0} jenis`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jenis:", error);
    return NextResponse.json(
      { error: "Failed to fetch jenis", message: String(error) },
      { status: 500 }
    );
  }
}

// POST create new jenis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(`[Jenis API] Creating new jenis:`, body);

    const response = await fetch(`${BACKEND_URL}/jenis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Jenis API] Created jenis with id: ${data.id}`);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating jenis:", error);
    return NextResponse.json(
      { error: "Failed to create jenis", message: String(error) },
      { status: 500 }
    );
  }
}
