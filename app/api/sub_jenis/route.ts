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

    // Transform ref_jenis_id to jenis_id for frontend consistency
    const transformedData = Array.isArray(data.data) ? data.data.map((item: Record<string, unknown>) => ({
      id: item.id,
      nama_id: item.nama_id,
      nama_en: item.nama_en,
      jenis_id: item.ref_jenis_id || item.jenis_id,
    })) : [];

    return NextResponse.json({
      message: data.message || "Sub Jenis retrieved",
      data: transformedData,
    });
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
    console.log(`[SubJenis API] POST to: ${BACKEND_URL}/sub_jenis`);

    // Transform jenis_id to ref_jenis_id (backend expects ref_jenis_id)
    const backendBody = {
      nama_id: body.nama_id,
      nama_en: body.nama_en,
      ref_jenis_id: body.jenis_id || body.ref_jenis_id,
    };
    console.log(`[SubJenis API] Transformed body for backend:`, backendBody);

    const response = await fetch(`${BACKEND_URL}/sub_jenis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendBody),
    });

    // Read raw response for debugging
    const responseText = await response.text();
    console.log(`[SubJenis API] Raw response status: ${response.status}`);
    console.log(`[SubJenis API] Raw response body:`, responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("[SubJenis API] Failed to parse response as JSON:", responseText);
      throw new Error(`Invalid JSON response from backend: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      // Extract error message from various possible formats
      const errorMessage = data.message || data.error || data.msg || `Backend responded with status: ${response.status}`;
      console.error(`[SubJenis API] Backend error:`, data);
      throw new Error(errorMessage);
    }

    console.log(`[SubJenis API] Created sub_jenis:`, data);

    // Transform ref_jenis_id back to jenis_id for frontend consistency
    const resultData = {
      id: data.id,
      nama_id: data.nama_id,
      nama_en: data.nama_en,
      jenis_id: data.ref_jenis_id || data.jenis_id,
    };
    return NextResponse.json(resultData, { status: 201 });
  } catch (error) {
    console.error("Error creating sub_jenis:", error);
    return NextResponse.json(
      { error: "Failed to create sub_jenis", message: String(error) },
      { status: 500 }
    );
  }
}

