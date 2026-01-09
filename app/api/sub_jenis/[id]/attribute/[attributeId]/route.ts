import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:5000";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attributeId: string }> }
) {
  try {
    const { id, attributeId } = await params;
    const body = await request.json();

    const response = await fetch(
      `${API_URL}/sub_jenis/${id}/attribute/${attributeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), // Body berisi { harga: number }
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create sub_jenis_attribute" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; attributeId: string }> }
) {
  try {
    const { id, attributeId } = await params;
    const response = await fetch(
      `${API_URL}/sub_jenis/${id}/attribute/${attributeId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete sub_jenis_attribute" },
      { status: 500 }
    );
  }
}
