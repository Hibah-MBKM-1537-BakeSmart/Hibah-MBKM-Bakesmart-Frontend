import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// GET all sub_jenis
export async function GET() {
  try {
    console.log(`[SubJenis API] GET all sub_jenis from: ${BACKEND_URL}/sub_jenis`);

    const response = await fetch(`${BACKEND_URL}/sub_jenis`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const responseText = await response.text();
    console.log(`[SubJenis API] Raw response:`, responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("[SubJenis API] Failed to parse response as JSON");
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
    }

    // Check if backend returned an error
    if (data.error) {
      console.error("[SubJenis API] Backend error:", data.error);
      // Return empty data instead of throwing error (graceful degradation)
      return NextResponse.json({ 
        message: "Sub Jenis retrieved (with backend error)", 
        data: [],
        backendError: data.error 
      });
    }

    if (!response.ok) {
      console.error(`[SubJenis API] Backend responded with status: ${response.status}`);
      return NextResponse.json({ 
        message: "Sub Jenis retrieved (with error)", 
        data: [],
        backendError: `Status ${response.status}` 
      });
    }

    console.log(`[SubJenis API] Retrieved ${data.data?.length || 0} sub_jenis`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[SubJenis API] Error fetching sub_jenis:", error);
    // Return empty data for graceful degradation
    return NextResponse.json({
      message: "Sub Jenis retrieved (fetch failed)",
      data: [],
      error: String(error)
    });
  }
}

// POST create new sub_jenis
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(`[SubJenis API] Creating new sub_jenis:`, body);

    const response = await fetch(`${BACKEND_URL}/sub_jenis`, {
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
    console.log(`[SubJenis API] Created sub_jenis with id: ${data.id}`);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating sub_jenis:", error);
    return NextResponse.json(
      { error: "Failed to create sub_jenis", message: String(error) },
      { status: 500 }
    );
  }
}
