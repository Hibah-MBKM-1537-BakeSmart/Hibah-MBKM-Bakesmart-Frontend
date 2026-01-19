import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RouteParams {
  params: Promise<{ id: string; hariId: string }>;
}

// POST - Add hari to product
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, hariId } = await params;
    console.log(`[Product Hari API] POST relation - product: ${productId}, hari: ${hariId}`);

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/hari/${hariId}`,
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
          message: errorData.message || "This product already has the assigned hari.",
          product_id: productId,
          hari_id: hariId,
        },
        { status: 409 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Product Hari API] POST success:`, data);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Product Hari API] POST error:", error);
    return NextResponse.json(
      { status: "fail", message: "Failed to add hari to product", error: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Remove hari from product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, hariId } = await params;
    console.log(`[Product Hari API] DELETE relation - product: ${productId}, hari: ${hariId}`);

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/hari/${hariId}`,
      {
        method: "DELETE",
        headers: createAuthHeaders(request),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { status: "fail", message: "Product_Hari relation not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Product Hari API] DELETE success:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Product Hari API] DELETE error:", error);
    return NextResponse.json(
      { status: "fail", message: "Failed to remove hari from product", error: String(error) },
      { status: 500 }
    );
  }
}
