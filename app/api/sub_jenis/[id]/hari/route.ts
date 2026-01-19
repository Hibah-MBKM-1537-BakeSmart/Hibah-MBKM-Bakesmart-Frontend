import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:5000";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const response = await fetch(`${API_URL}/sub_jenis/${id}/hari`, {
      method: "GET",
      headers: createAuthHeaders(request),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch hari" },
      { status: 500 }
    );
  }
}
