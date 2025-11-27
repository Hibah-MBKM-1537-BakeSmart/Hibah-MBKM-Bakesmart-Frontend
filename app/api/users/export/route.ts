import { NextResponse } from "next/server";

const host = process.env.API_HOST || "localhost";
const port = process.env.API_PORT || "5000";
const BACKEND_EXPORT_URL = `http://${host}:${port}/users/export`;

export async function GET() {
  try {
    const response = await fetch(BACKEND_EXPORT_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/octet-stream' },
      cache: 'no-store'
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[API Users Export] Backend Error:', err);
      return NextResponse.json({ message: err.message || 'Failed to export users' }, { status: response.status });
    }

    const buffer = await response.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=users.xlsx'
      }
    });
  } catch (error: any) {
    console.error('[API Users Export] Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
