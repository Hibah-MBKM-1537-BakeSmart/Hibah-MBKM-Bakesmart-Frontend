import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:5000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hariId: string }> }
) {
  try {
    const { id, hariId } = await params;
    const response = await fetch(`${API_URL}/sub_jenis/${id}/hari/${hariId}`, {
      method: "POST",
      headers: createAuthHeaders(request),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create sub_jenis_hari" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; hariId: string }> }
) {
  try {
    const { id, hariId } = await params;
    const response = await fetch(`${API_URL}/sub_jenis/${id}/hari/${hariId}`, {
      method: "DELETE",
      headers: createAuthHeaders(request),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete sub_jenis_hari" },
      { status: 500 }
    );
  }
}
