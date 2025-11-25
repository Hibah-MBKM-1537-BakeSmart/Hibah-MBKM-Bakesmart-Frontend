import { NextResponse } from "next/server";

const host = process.env.API_HOST;
const port = process.env.API_PORT;
// PENTING: Pastikan URL ini mengarah ke endpoint 'coordinates' backend Anda
const BACKEND_RATES_URL = "http://${host}:${port}/orders/rates/coordinates";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log(
      "[API Rates] Mengirim payload ke Backend:",
      JSON.stringify(payload, null, 2)
    );

    const response = await fetch(BACKEND_RATES_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
