import { NextResponse } from "next/server";
const host = process.env.API_HOST;
const port = process.env.API_PORT;
const BACKEND_VOUCHER_URL = `http://${host}:${port}/voucher`;

/**
 * GET /api/vouchers/[id] - Get voucher by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const response = await fetch(`${BACKEND_VOUCHER_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API Vouchers GET by ID] Backend Error:", data);
      return NextResponse.json(
        { message: data.message || "Voucher tidak ditemukan" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Vouchers GET by ID] Server Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/vouchers/[id] - Update voucher
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const payload = await request.json();

    console.log("[API Vouchers PUT] Updating voucher:", id, payload);

    const response = await fetch(`${BACKEND_VOUCHER_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API Vouchers PUT] Backend Error:", data);
      return NextResponse.json(
        { message: data.message || "Gagal mengupdate voucher" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Vouchers PUT] Server Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vouchers/[id] - Delete voucher
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    console.log("[API Vouchers DELETE] Deleting voucher:", id);

    const response = await fetch(`${BACKEND_VOUCHER_URL}/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API Vouchers DELETE] Backend Error:", data);
      return NextResponse.json(
        { message: data.message || "Gagal menghapus voucher" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Vouchers DELETE] Server Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
