import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get auth headers
    const authHeaders = createAuthHeaders(request);

    const response = await fetch(`${BACKEND_URL}/api/v1/whatsapp/blast`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", errorText);
      return NextResponse.json(
        { error: "Failed to send blast message" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending blast message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
