import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const BACKEND_URL_ORDERS = `${BACKEND_URL}/orders`;

/**
 * POST /api/orders/kasir
 * Create order from kasir (pickup mode only)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Kasir Orders API] Creating order:", body);

    const {
      user_id,
      items,
      total_harga,
      provider_pembayaran,
      waktu_ambil,
      catatan,
      voucher_id,
    } = body;

    // Validate required fields
    if (!user_id || !items || items.length === 0 || !total_harga) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, items, total_harga" },
        { status: 400 }
      );
    }

    // Transform items to match backend format
    const transformedItems = items.map((item: any) => ({
      id: item.product_id || item.id,
      jumlah: item.quantity || item.jumlah,
      harga_beli: item.harga_beli || item.price,
      note: item.note || "",
    }));

    // Prepare order payload for backend (pickup mode)
    const orderPayload = {
      mode_pengiriman: "pickup",
      waktu_ambil: waktu_ambil || new Date().toISOString(),
      catatan: catatan || "",

      voucher_id: voucher_id || null,
      user_id: user_id,
      provider_pembayaran: provider_pembayaran || "cash",
      items: transformedItems,
      total_harga: total_harga,

      // Pickup mode doesn't need these, but backend might require them
      courier_company: null,
      shipping_cost: null,
    };

    console.log("[Kasir Orders API] Sending to backend:", orderPayload);

    const response = await fetch(BACKEND_URL_ORDERS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Kasir Orders API] Backend error:`, errorData);
      throw new Error(errorData.message || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    console.log("[Kasir Orders API] Order created successfully:", data);

    return NextResponse.json(data);
  } catch (error) {
    console.error("[Kasir Orders API] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
