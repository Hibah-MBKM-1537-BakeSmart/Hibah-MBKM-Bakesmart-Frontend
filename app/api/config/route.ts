import { NextResponse } from "next/server";
const host = process.env.API_HOST || "localhost";
const port = process.env.API_PORT || "5000";
const BACKEND_URL = `http://${host}:${port}`;

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

    // Parse operating_hours jika berupa string
    if (data.operating_hours && typeof data.operating_hours === "string") {
      try {
        data.operating_hours = JSON.parse(data.operating_hours);
      } catch (e) {
        data.operating_hours = [];
      }
    }

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
    const configData: Record<string, unknown> = {};

    // Only send fields that are provided
    if (body.is_tutup !== undefined) configData.is_tutup = body.is_tutup;
    if (body.pesan !== undefined) configData.pesan = body.pesan;
    if (body.tgl_buka !== undefined) configData.tgl_buka = body.tgl_buka;
    if (body.limit_pesanan_harian !== undefined)
      configData.limit_pesanan_harian = body.limit_pesanan_harian;
    if (body.limit_jam_order !== undefined)
      configData.limit_jam_order = body.limit_jam_order;
    if (body.latitude !== undefined) configData.latitude = body.latitude;
    if (body.longitude !== undefined) configData.longitude = body.longitude;
    if (body.whatsapp_number !== undefined)
      configData.whatsapp_number = body.whatsapp_number;
    if (body.is_delivery_enabled !== undefined)
      configData.is_delivery_enabled = body.is_delivery_enabled;

    // Handle operating_hours - kirim sebagai array (backend akan handle merge)
    if (body.operating_hours !== undefined) {
      configData.operating_hours = body.operating_hours;
    }

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

    // Parse operating_hours jika berupa string
    if (data.operating_hours && typeof data.operating_hours === "string") {
      try {
        data.operating_hours = JSON.parse(data.operating_hours);
      } catch (e) {
        data.operating_hours = [];
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
