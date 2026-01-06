import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get all product images
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    console.log(`[Product Gambar API] GET all images for product: ${productId}`);

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/gambar`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Product Gambar API] GET success:`, data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Product Gambar API] GET error:", error);
    return NextResponse.json(
      { status: "fail", message: "Failed to get product images", error: String(error) },
      { status: 500 }
    );
  }
}

// POST - Upload image to product
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: productId } = await params;
    console.log(`[Product Gambar API] POST upload image for product: ${productId}`);

    // Get the form data from request
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json(
        { status: "fail", message: "No file provided" },
        { status: 400 }
      );
    }

    // Forward the form data to backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const response = await fetch(
      `${BACKEND_URL}/products/${productId}/gambar`,
      {
        method: "POST",
        body: backendFormData,
        // Don't set Content-Type header, let fetch handle multipart/form-data
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Product Gambar API] POST success:`, data);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[Product Gambar API] POST error:", error);
    return NextResponse.json(
      { status: "fail", message: "Failed to upload image", error: String(error) },
      { status: 500 }
    );
  }
}
