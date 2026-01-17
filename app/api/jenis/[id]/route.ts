import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// GET jenis by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[Jenis API] GET jenis by id: ${id}`);

    const response = await fetch(`${BACKEND_URL}/jenis/${id}`, {
      method: "GET",
      headers: createAuthHeaders(request),
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Jenis not found" },
          { status: 404 }
        );
      }
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jenis:", error);
    return NextResponse.json(
      { error: "Failed to fetch jenis", message: String(error) },
      { status: 500 }
    );
  }
}

// PUT update jenis
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(`[Jenis API] Updating jenis ${id}:`, body);

    const response = await fetch(`${BACKEND_URL}/jenis/${id}`, {
      method: "PUT",
      headers: createAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Jenis not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Jenis API] Updated jenis ${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating jenis:", error);
    return NextResponse.json(
      { error: "Failed to update jenis", message: String(error) },
      { status: 500 }
    );
  }
}

// DELETE jenis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[Jenis API] Deleting jenis ${id}`);

    const response = await fetch(`${BACKEND_URL}/jenis/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(request),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Jenis not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Jenis API] Deleted jenis ${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error deleting jenis:", error);
    return NextResponse.json(
      { error: "Failed to delete jenis", message: String(error) },
      { status: 500 }
    );
  }
}
