import { NextResponse } from "next/server";
const host = process.env.API_HOST || '192.168.1.29';
const port = process.env.API_PORT || '5000';
const BACKEND_VOUCHER_URL = `http://${host}:${port}/voucher`;

/**
 * GET /api/vouchers - Get all vouchers
 */
export async function GET() {
  try {
    const response = await fetch(BACKEND_VOUCHER_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Disable caching for fresh data
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API Vouchers GET] Backend Error:", data);
      return NextResponse.json(
        { message: data.message || "Gagal mengambil vouchers" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Vouchers GET] Server Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vouchers - Create new voucher
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    console.log("[API Vouchers POST] Creating voucher:", payload);

    const response = await fetch(BACKEND_VOUCHER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API Vouchers POST] Backend Error:", data);
      return NextResponse.json(
        { message: data.message || "Gagal membuat voucher" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[API Vouchers POST] Server Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
