import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// GET sub_jenis by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[SubJenis API] GET sub_jenis by id: ${id}`);

    const response = await fetch(`${BACKEND_URL}/sub_jenis/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Sub Jenis not found" },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching sub_jenis:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub_jenis", message: String(error) },
      { status: 500 }
    );
  }
}

// PUT update sub_jenis
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(`[SubJenis API] Updating sub_jenis ${id}:`, body);

    const response = await fetch(`${BACKEND_URL}/sub_jenis/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Sub Jenis not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[SubJenis API] Updated sub_jenis ${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating sub_jenis:", error);
    return NextResponse.json(
      { error: "Failed to update sub_jenis", message: String(error) },
      { status: 500 }
    );
  }
}

// DELETE sub_jenis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[SubJenis API] Deleting sub_jenis ${id}`);

    const response = await fetch(`${BACKEND_URL}/sub_jenis/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Sub Jenis not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[SubJenis API] Deleted sub_jenis ${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting sub_jenis:", error);
    return NextResponse.json(
      { error: "Failed to delete sub_jenis", message: String(error) },
      { status: 500 }
    );
  }
}
