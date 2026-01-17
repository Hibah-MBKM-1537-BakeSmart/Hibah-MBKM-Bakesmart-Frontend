import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest, { params }: { params: Promise<{ user_id: string; product_voucher_id: string }> }) {
  try {
    const { user_id, product_voucher_id } = await params;
    const url = `${BACKEND_URL}/users/${user_id}/voucher/${product_voucher_id}`;

    const response = await fetch(url, { method: 'GET', headers: createAuthHeaders(request), cache: 'no-store' });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[API UserVoucher GET] Backend Error:', data);
      return NextResponse.json({ message: data.message || 'Failed to get voucher' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API UserVoucher GET] Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ user_id: string; product_voucher_id: string }> }) {
  try {
    const { user_id, product_voucher_id } = await params;
    // prefer forwarding either request body or use path params to construct payload
    const body = await request.json().catch(() => null) || { user_id, product_voucher_id };

    const url = `${BACKEND_URL}/users/${user_id}/voucher/${product_voucher_id}`;
    const response = await fetch(url, { method: 'POST', headers: createAuthHeaders(request), body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[API UserVoucher POST] Backend Error:', data);
      return NextResponse.json({ message: data.message || 'Failed to create user voucher' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('[API UserVoucher POST] Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ user_id: string; product_voucher_id: string }> }) {
  try {
    const { user_id, product_voucher_id } = await params;
    const url = `${BACKEND_URL}/users/${user_id}/voucher/${product_voucher_id}`;

    const response = await fetch(url, { method: 'DELETE', headers: createAuthHeaders(request) });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[API UserVoucher DELETE] Backend Error:', data);
      return NextResponse.json({ message: data.message || 'Failed to delete user voucher' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API UserVoucher DELETE] Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
