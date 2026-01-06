import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const BACKEND_URL_KASIR = `${BACKEND_URL}/orders/kasir`;

/**
 * POST /api/orders/kasir
 * Create order from kasir/POS (simplified endpoint for in-store sales)
 * 
 * Backend Documentation (POST /orders/kasir):
 * - Simplified version for in-store staff selling available stock ("roti sisa/stock")
 * - Does NOT require shipping coordinates or courier data
 * - Does NOT register with external logistics providers (Biteship)
 * - Automatically sets Production Status to "completed"
 * - Automatically sets Order Status to "paid"
 * - Still handles auto-user creation based on phone number
 * 
 * Expected frontend payload:
 * {
 *   customerName: string,
 *   customerPhone: string,
 *   items: [{ product_id, jumlah, harga_beli, note }],
 *   total_harga: number,
 *   provider_pembayaran: string,
 *   waktu_ambil: string (date YYYY-MM-DD),
 *   catatan?: string,
 *   voucher_id?: number
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[Kasir Orders API] Received request:", body);

    const {
      customerName,
      customerPhone,
      items,
      total_harga,
      provider_pembayaran,
      waktu_ambil,
      catatan,
      voucher_id,
    } = body;

    // Validate required fields
    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Missing required fields: customerName and customerPhone" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!total_harga) {
      return NextResponse.json(
        { error: "Missing total_harga" },
        { status: 400 }
      );
    }

    // Transform items to match backend format
    // Backend expects: { id, jumlah, harga_beli, note }
    const transformedItems = items.map((item: any) => ({
      id: item.product_id || item.id,
      jumlah: item.jumlah || item.quantity,
      harga_beli: item.harga_beli || item.price,
      note: item.note || null,
    }));

    // Format date - backend expects "YYYY-MM-DD" format
    let formattedDate = waktu_ambil;
    if (waktu_ambil && waktu_ambil.includes('T')) {
      formattedDate = waktu_ambil.split('T')[0];
    } else if (!waktu_ambil) {
      formattedDate = new Date().toISOString().split('T')[0];
    }

    // Prepare order payload for kasir endpoint
    // Note: Kasir endpoint is simplified - no shipping/courier data needed
    // Backend automatically sets production_status="completed" and order_status="paid"
    const orderPayload = {
      // Timing
      waktu_ambil: formattedDate,
      
      // Customer contact info (for auto-user creation based on phone)
      destination_contact_name: customerName,
      destination_contact_phone: customerPhone,

      // Cart items with pricing
      items: transformedItems,
      total_harga: total_harga,

      // Voucher (optional)
      voucher_id: voucher_id || null,

      // Payment provider
      provider_pembayaran: provider_pembayaran || "cash",
      
      // Notes
      catatan: catatan || "",
    };

    console.log("[Kasir Orders API] Sending to backend:", JSON.stringify(orderPayload, null, 2));

    // Call the dedicated kasir endpoint - automatically sets status to "paid" and production to "completed"
    const response = await fetch(BACKEND_URL_KASIR, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const responseText = await response.text();
    console.log("[Kasir Orders API] Backend raw response:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("[Kasir Orders API] Failed to parse response:", responseText);
      throw new Error(`Invalid JSON response from backend: ${responseText.substring(0, 200)}`);
    }

    if (!response.ok) {
      console.error(`[Kasir Orders API] Backend error:`, data);
      throw new Error(data.message || data.error || `Backend error: ${response.status}`);
    }

    console.log("[Kasir Orders API] Order created successfully:", data);
    
    // Note: No need to auto-confirm for kasir orders
    // The /orders/kasir endpoint automatically sets:
    // - Production Status: "completed"
    // - Order Status: "paid"

    return NextResponse.json({
      success: true,
      message: data.message || "Order created successfully",
      data: {
        id: data.id,
        user_id: data.user_id,
        status: "paid", // Kasir orders are automatically paid
        production_status: "completed", // Kasir orders are automatically completed
      }
    });
  } catch (error) {
    console.error("[Kasir Orders API] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create order",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

