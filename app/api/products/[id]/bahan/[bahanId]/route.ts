import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RouteParams {
  params: Promise<{ id: string; bahanId: string }>;
}

// POST - Add bahan to product
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, bahanId } = await params;

    const body = await request.json(); // get frontend body

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/bahan/${bahanId}`,
      {
        method: "POST",
        headers: {
          ...createAuthHeaders(request),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body), // forward body
      }
    );

    // Handle conflict (409)
    if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: "fail",
          message:
            errorData.message || "This product already has this bahan.",
        },
        { status: 409 }
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Backend responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(`[Product Bahan API] POST success:`, data);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Product Bahan API] POST error:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Failed to add bahan",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove bahan from product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, bahanId } = await params;
    console.log(
      `[Product Bahan API] DELETE relation - product: ${productId}, bahan: ${bahanId}`
    );

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/bahan/${bahanId}`,
      {
        method: "DELETE",
        headers: createAuthHeaders(request),
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { status: "fail", message: "Product bahan not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Backend responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(`[Product Bahan API] DELETE success:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Product Bahan API] DELETE error:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Failed to delete bahan",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
