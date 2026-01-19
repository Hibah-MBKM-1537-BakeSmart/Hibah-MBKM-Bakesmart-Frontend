import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const BACKEND_QR_URL = `${BACKEND_URL}/qr/create`;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("[API QR] Requesting QR Code for:", payload.text);

    // Get auth headers
    const authHeaders = createAuthHeaders(request);

    // Forward request ke Backend Hapi.js
    const response = await fetch(BACKEND_QR_URL, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({
        text: payload.text, // Kirim kode voucher sebagai text
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API QR] Backend Error:", data);
      return NextResponse.json(
        { message: data.message || "Gagal membuat QR Code" },
        { status: response.status }
      );
    }

    // Backend mengembalikan: { data: { dataUrl: "data:image/png;base64,..." } }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API QR] Server Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
