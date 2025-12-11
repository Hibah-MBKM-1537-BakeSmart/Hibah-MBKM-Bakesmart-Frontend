import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// GET /api/config - Fetch store configuration
export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/config`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Failed to fetch config from backend" },
        { status: response.status }
      );
    }

    const result = await response.json();
    // Backend returns { message, data: {...} }, extract the data
    const data = result.data || result;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/config - Update store configuration
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Format the request body to match backend expectations
    // Only send the fields that backend expects
    const configData = {
      is_tutup: body.is_tutup ?? false,
      pesan: body.pesan ?? "",
      tgl_buka: body.tgl_buka ?? "",
      limit_pesanan_harian: body.limit_pesanan_harian ?? 20,
      limit_jam_order: body.limit_jam_order ?? "15:00:00",
      latitude: body.latitude ?? "",
      longitude: body.longitude ?? "",
    };
    
    const response = await fetch(`${BACKEND_URL}/config`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(configData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Failed to update config in backend" },
        { status: response.status }
      );
    }

    const result = await response.json();
    // Backend might return { message, data: {...} }, extract the data
    const data = result.data || result;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
