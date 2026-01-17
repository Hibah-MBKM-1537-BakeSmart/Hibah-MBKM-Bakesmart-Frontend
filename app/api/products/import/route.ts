import { NextResponse } from "next/server";
import { getAuthHeader } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const EXTERNAL_API_URL = `${BACKEND_URL}/products/import`;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    console.log(`[Products Import API] POST import to: ${EXTERNAL_API_URL}`);

    // Get auth header for FormData (don't set Content-Type, let browser handle it)
    const authHeader = getAuthHeader(request);
    const headers: HeadersInit = {};
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      console.error(`[Products Import API] Error: ${response.status}`);
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Products Import API] Error:", error);
    return NextResponse.json(
      { error: "Failed to import products" },
      { status: 500 }
    );
  }
}
