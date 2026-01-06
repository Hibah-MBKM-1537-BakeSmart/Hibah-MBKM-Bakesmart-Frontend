import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RouteParams {
  params: Promise<{ id: string; gambarId: string }>;
}

// DELETE - Remove image from product
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId, gambarId } = await params;
    console.log(`[Product Gambar API] DELETE image - product: ${productId}, gambar: ${gambarId}`);

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/gambar/${gambarId}`,
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
          { status: "fail", message: "Image not found" },
          { status: 404 }
        );
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Product Gambar API] DELETE success:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Product Gambar API] DELETE error:", error);
    return NextResponse.json(
      { status: "fail", message: "Failed to delete image", error: String(error) },
      { status: 500 }
    );
  }
}
