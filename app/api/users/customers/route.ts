import { NextResponse } from "next/server";

const host = process.env.API_HOST || "localhost";
const port = process.env.API_PORT || "5000";
const BACKEND_URL = `http://${host}:${port}/users/customers`;

export async function GET() {
  try {
    const response = await fetch(BACKEND_URL, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[API Users Customers] Backend Error:', data);
      return NextResponse.json({ message: data.message || 'Failed to fetch customers' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Users Customers] Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error', data: [] }, { status: 500 });
  }
}
