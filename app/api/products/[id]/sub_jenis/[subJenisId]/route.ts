import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RouteParams {
  params: Promise<{ id: string; subJenisId: string }>;
}

// GET - Get product sub_jenis relation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, subJenisId } = await params;
    console.log(`[Product SubJenis API] GET relation - product: ${productId}, sub_jenis: ${subJenisId}`);

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/sub_jenis/${subJenisId}`,
      {
        method: "GET",
        headers: createAuthHeaders(request),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { status: "fail", message: "Product_Sub_Jenis not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Product SubJenis API] GET success:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Product SubJenis API] GET error:", error);
    return NextResponse.json(
      { status: "fail", message: "Failed to get product sub_jenis", error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create product sub_jenis relation
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, subJenisId } = await params;
    console.log(`[Product SubJenis API] POST relation - product: ${productId}, sub_jenis: ${subJenisId}`);

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/sub_jenis/${subJenisId}`,
      {
        method: "POST",
        headers: createAuthHeaders(request),
      }
    );

    // Handle conflict (409)
    if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: "fail",
          message: errorData.message || "This product already has the assigned sub_jenis.",
          product_id: productId,
          sub_jenis_id: subJenisId,
        },
        { status: 409 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Product SubJenis API] POST success:`, data);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Product SubJenis API] POST error:", error);
    return NextResponse.json(
      { status: "fail", message: "Failed to create product sub_jenis", error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete product sub_jenis relation
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, subJenisId } = await params;
    console.log(`[Product SubJenis API] DELETE relation - product: ${productId}, sub_jenis: ${subJenisId}`);

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/sub_jenis/${subJenisId}`,
      {
        method: "DELETE",
        headers: createAuthHeaders(request),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { status: "fail", message: "Product_Sub_Jenis not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Product SubJenis API] DELETE success:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Product SubJenis API] DELETE error:", error);
    return NextResponse.json(
      { status: "fail", message: "Failed to delete product sub_jenis", error: String(error) },
      { status: 500 }
    );
  }
}
