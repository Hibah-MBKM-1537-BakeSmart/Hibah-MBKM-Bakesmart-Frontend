import { NextResponse } from "next/server";

const host = process.env.API_HOST || "localhost";
const port = process.env.API_PORT || "5000";
const BACKEND_USERS_URL = `http://${host}:${port}/users`;

export async function GET() {
  try {
    const response = await fetch(BACKEND_USERS_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[API Users GET] Backend Error:", data);
      return NextResponse.json({ message: data.message || "Gagal mengambil users" }, { status: response.status });
    }

    // normalize with data.data if backend wraps it
    const payload = data?.data?.data || data?.data || data;

    return NextResponse.json({ message: "Users retrieved", data: Array.isArray(payload) ? payload : [] }, { status: 200 });
  } catch (error: any) {
    console.error("[API Users GET] Server Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error", data: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(BACKEND_USERS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[API Users POST] Backend Error:", data);
      return NextResponse.json({ message: data.message || "Gagal membuat user" }, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[API Users POST] Server Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
