import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get auth headers
    const authHeaders = createAuthHeaders(request);

    const response = await fetch(`${BACKEND_URL}/orders/date`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Backend responded with status: ${response.status}`
      );
    }

    const data = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching orders by date:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch orders by date",
        data: [],
      },
      { status: 500 }
    );
  }
}
