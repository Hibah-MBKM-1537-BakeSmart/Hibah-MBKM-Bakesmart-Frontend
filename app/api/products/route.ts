import { NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:5000/products";

export async function GET(request: Request) {
  try {
    console.log(`[Products API] GET all products from: ${BACKEND_URL}`);

    const response = await fetch(BACKEND_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[Products API] Error: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Products API] Success, received ${data?.data?.data?.length || 0} products`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Products API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(`[Products API] POST new product:`, body);

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[Products API] POST Error: ${response.status}`);
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[Products API] POST Success`);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Products API] POST Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}
