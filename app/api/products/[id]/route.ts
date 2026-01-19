import { NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const BACKEND_PRODUCTS_URL = `${BACKEND_URL}/products`;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[Products API] GET product by ID: ${id}`);

    const response = await fetch(`${BACKEND_PRODUCTS_URL}/${id}`, {
      method: "GET",
      headers: createAuthHeaders(request),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[Products API] GET Error: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Products API] GET Success for ID: ${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Products API] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log(`[Products API] PUT product ID: ${id}`, body);

    const response = await fetch(`${BACKEND_PRODUCTS_URL}/${id}`, {
      method: "PUT",
      headers: createAuthHeaders(request),
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[Products API] PUT Error: ${response.status}`);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Products API] PUT Success for ID: ${id}`);
    console.log(`[Products API] PUT Response data:`, JSON.stringify(data));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Products API] PUT Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`[Products API] DELETE product ID: ${id}`);

    const response = await fetch(`${BACKEND_PRODUCTS_URL}/${id}`, {
      method: "DELETE",
      headers: createAuthHeaders(request),
    });

    if (!response.ok) {
      console.error(`[Products API] DELETE Error: ${response.status}`);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Products API] DELETE Success for ID: ${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Products API] DELETE Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 }
    );
  }
}
