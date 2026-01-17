import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const BACKEND_RATES_URL = `${BACKEND_URL}/orders/rates/coordinates`;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log(
      "[API Rates] Mengirim payload ke Backend:",
      JSON.stringify(payload, null, 2)
    );

    // Get auth headers
    const authHeaders = createAuthHeaders(request);

    const response = await fetch(BACKEND_RATES_URL, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API Rates] Backend Error Response:", data);
      // Teruskan pesan error dari backend ke frontend agar bisa dibaca
      return NextResponse.json(
        { message: data.message || "Gagal cek ongkir dari Backend" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Rates] Server Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
