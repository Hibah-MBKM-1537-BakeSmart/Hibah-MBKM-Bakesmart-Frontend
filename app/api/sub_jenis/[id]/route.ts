import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

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
      headers: createAuthHeaders(request),
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
    console.log(`[SubJenis API] PUT to: ${BACKEND_URL}/sub_jenis/${id}`);

    // Transform jenis_id to ref_jenis_id (backend expects ref_jenis_id)
    const backendBody: Record<string, unknown> = {};
    if (body.nama_id !== undefined) backendBody.nama_id = body.nama_id;
    if (body.nama_en !== undefined) backendBody.nama_en = body.nama_en;
    if (body.jenis_id !== undefined) backendBody.ref_jenis_id = body.jenis_id;
    if (body.ref_jenis_id !== undefined) backendBody.ref_jenis_id = body.ref_jenis_id;
    console.log(`[SubJenis API] Transformed body for backend:`, backendBody);

    const response = await fetch(`${BACKEND_URL}/sub_jenis/${id}`, {
      method: "PUT",
      headers: createAuthHeaders(request),
      body: JSON.stringify(backendBody),
    });

    // Read raw response for debugging
    const responseText = await response.text();
    console.log(`[SubJenis API] Raw response status: ${response.status}`);
    console.log(`[SubJenis API] Raw response body:`, responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("[SubJenis API] Failed to parse response as JSON:", responseText);
      throw new Error(`Invalid JSON response from backend: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Sub Jenis not found" },
          { status: 404 }
        );
      }
      const errorMessage = data.message || data.error || data.msg || `Backend responded with status: ${response.status}`;
      console.error(`[SubJenis API] Backend error:`, data);
      throw new Error(errorMessage);
    }

    console.log(`[SubJenis API] Updated sub_jenis ${id}:`, data);

    // Transform ref_jenis_id back to jenis_id for frontend consistency
    const resultData = {
      id: data.id || Number(id),
      nama_id: data.nama_id,
      nama_en: data.nama_en,
      jenis_id: data.ref_jenis_id || data.jenis_id,
    };
    return NextResponse.json(resultData);
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
    console.log(`[SubJenis API] DELETE to: ${BACKEND_URL}/sub_jenis/${id}`);

    const response = await fetch(`${BACKEND_URL}/sub_jenis/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(request),
    });

    // Read raw response for debugging
    const responseText = await response.text();
    console.log(`[SubJenis API] Raw response status: ${response.status}`);
    console.log(`[SubJenis API] Raw response body:`, responseText);

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("[SubJenis API] Failed to parse response as JSON:", responseText);
      throw new Error(`Invalid JSON response from backend: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Sub Jenis not found" },
          { status: 404 }
        );
      }
      const errorMessage = data.message || data.error || data.msg || `Backend responded with status: ${response.status}`;
      console.error(`[SubJenis API] Backend error:`, data);
      throw new Error(errorMessage);
    }

    console.log(`[SubJenis API] Deleted sub_jenis ${id}:`, data);

    const resultData = data.data || data;
    return NextResponse.json(resultData);
  } catch (error) {
    console.error("Error deleting sub_jenis:", error);
    return NextResponse.json(
      { error: "Failed to delete sub_jenis", message: String(error) },
      { status: 500 }
    );
  }
}
