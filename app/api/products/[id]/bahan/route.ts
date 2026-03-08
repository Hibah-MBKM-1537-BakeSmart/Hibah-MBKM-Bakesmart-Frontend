import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Retrieve bahan for a product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    console.log(
      `[Product Bahan API] GET relation - product: ${productId}`
    );

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/bahan`,
      {
        method: "GET",
        headers: createAuthHeaders(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Backend responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(`[Product Bahan API] GET success:`, data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[Product Bahan API] GET error:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Failed to retrieve bahan",
        error: String(error),
      },
      { status: 500 }
    );
  }
}