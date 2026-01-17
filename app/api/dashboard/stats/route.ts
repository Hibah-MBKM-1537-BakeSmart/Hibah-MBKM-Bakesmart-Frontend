import { NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const BACKEND_STATS_URL = `${BACKEND_URL}/dashboard/stats`;

/**
 * GET /api/dashboard/stats - Get dashboard statistics
 */
export async function GET(request: Request) {
  try {
    const response = await fetch(BACKEND_STATS_URL, {
      method: "GET",
      headers: createAuthHeaders(request),
      cache: "no-store", // Disable caching for fresh data
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API Dashboard Stats GET] Backend Error:", data);
      return NextResponse.json(
        { message: data.message || "Gagal mengambil statistik dashboard" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Dashboard Stats GET] Server Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
