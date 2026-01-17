import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/users/customers`, {
      method: "GET",
      headers: createAuthHeaders(request),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { message: "Failed to fetch customers", error: String(error) },
      { status: 500 }
    );
  }
}
