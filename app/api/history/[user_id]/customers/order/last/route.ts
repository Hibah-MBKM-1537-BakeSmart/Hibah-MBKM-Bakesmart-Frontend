import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: Request, { params }: { params: Promise<{ user_id: string }> }) {
  try {
    const { user_id } = await params;
    const url = `${BACKEND_URL}/users/${user_id}/customers/order/last`;

    const response = await fetch(url, { method: 'GET', headers: { 'Content-Type': 'application/json' }, cache: 'no-store' });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[API Users Last Order By ID] Backend Error:', data);
      return NextResponse.json({ message: data.message || 'Failed to fetch last order' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API Users Last Order By ID] Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error', data: null }, { status: 500 });
  }
}
