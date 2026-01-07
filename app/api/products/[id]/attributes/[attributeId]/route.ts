import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RouteParams {
  params: Promise<{ id: string; attributeId: string }>;
}

// POST - Add attribute to product
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, attributeId } = await params;
    console.log(
      `[Product Attribute API] POST relation - product: ${productId}, attribute: ${attributeId}`
    );

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/attributes/${attributeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Handle conflict (409)
    if (response.status === 409) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          status: "fail",
          message:
            errorData.message || "This product already has this attribute.",
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
    console.log(`[Product Attribute API] POST success:`, data);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Product Attribute API] POST error:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Failed to add attribute",
        error: String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE - Remove attribute from product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, attributeId } = await params;
    console.log(
      `[Product Attribute API] DELETE relation - product: ${productId}, attribute: ${attributeId}`
    );

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/attributes/${attributeId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { status: "fail", message: "Product attribute not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Backend responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log(`[Product Attribute API] DELETE success:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Product Attribute API] DELETE error:", error);
    return NextResponse.json(
      {
        status: "fail",
        message: "Failed to delete attribute",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
