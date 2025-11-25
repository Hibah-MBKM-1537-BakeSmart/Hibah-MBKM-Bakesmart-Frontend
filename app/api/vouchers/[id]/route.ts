import { NextResponse } from "next/server";
const host = process.env.API_HOST || '192.168.1.29';
const port = process.env.API_PORT || '5000';
const BACKEND_VOUCHER_URL = `http://${host}:${port}/voucher`;

/**
 * GET /api/vouchers/[id] - Get voucher by ID
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await request.json();

    console.log("[API Vouchers PUT] Updating voucher ID:", id);
    console.log("[API Vouchers PUT] Payload:", JSON.stringify(payload, null, 2));
    console.log("[API Vouchers PUT] Backend URL:", `${BACKEND_VOUCHER_URL}/${id}`);

    const response = await fetch(`${BACKEND_VOUCHER_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("[API Vouchers PUT] Response status:", response.status);

    const data = await response.json();
    console.log("[API Vouchers PUT] Response data:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("[API Vouchers PUT] Backend Error:", data);
      return NextResponse.json(
        { success: false, message: data.message || "Gagal mengupdate voucher" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Voucher berhasil diperbarui",
      data: data.data || data
    });
  } catch (error: any) {
    console.error("[API Vouchers PUT] Server Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/vouchers/[id] - Delete voucher
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
