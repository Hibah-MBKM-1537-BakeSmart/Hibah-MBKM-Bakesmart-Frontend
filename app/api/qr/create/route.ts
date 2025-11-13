import { NextResponse } from "next/server";

// Arahkan ke Backend Hapi.js (Gunakan 127.0.0.1 untuk localhost)
const BACKEND_QR_URL = "http://127.0.0.1:5000/qr/create";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("[API QR] Requesting QR Code for:", payload.text);

    // Forward request ke Backend Hapi.js
    const response = await fetch(BACKEND_QR_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
