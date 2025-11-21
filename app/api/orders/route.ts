import { NextRequest, NextResponse } from "next/server";

// Menggunakan 127.0.0.1 untuk menghindari masalah localhost di Node v18+
const EXTERNAL_API_URL = "http://127.0.0.1:5000/orders";

function transformPayloadForBackend(payload: any) {
  const { order, customer, items } = payload;

  // 1. Cek Pickup / Delivery
  const isPickup = customer.deliveryMode === "pickup";

  // 2. Koordinat Toko
  const originCoord = {
    latitude: -7.566139,
    longitude: 110.82303,
  };

  // 3. Koordinat Tujuan
  const destinationCoord = isPickup
    ? originCoord
    : {
        latitude: parseFloat(customer.coordinates?.latitude || "0"),
        longitude: parseFloat(customer.coordinates?.longitude || "0"),
      };

  // 4. Mapping Items (Struktur lengkap untuk DB & Biteship)
  const mergedItems = items.map((item: any) => ({
    id: Number(item.productId),
    name: item.productName,
    description: item.category || "Roti",
    category: item.category || "food",
    value: Number(item.basePrice),
    quantity: Number(item.quantity),

    // Mock Dimensi (Wajib ada untuk backend/biteship)
    height: 10,
    length: 10,
    weight: 50,
    width: 10,

    // Field Database Backend
    jumlah: Number(item.quantity),
    harga_beli: Number(item.basePrice),
    note:
      item.selectedAttributes?.map((attr: any) => attr.nama_id).join(", ") ||
      "-",
  }));

  // 5. FINAL PAYLOAD (Sesuai JSON backend developer)
  return {
    // Ini kuncinya: Gunakan orderDate (YYYY-MM-DD) yang dikirim frontend
    waktu_ambil: customer.orderDate || new Date().toISOString().split("T")[0],

    mode_pengiriman: customer.deliveryMode,
    catatan: customer.notes || "...",

    courier_company: isPickup ? "pickup" : "gojek",
    shipping_cost: Number(order.deliveryFee) || 0,

    diskon_id: null,
    user_id: 1,
    provider_pembayaran: order.paymentMethod || "cash",

    items: mergedItems,
    total_harga: Number(order.totalAmount),

    // Origin
    origin_contact_name: "Merpati Solo Bakery",
    origin_contact_phone: "081234567890",
    origin_contact_email: "admin@merpatisolo.com",
    origin_address: "Jalan Merpati 123, Solo, 57133",
    origin_coordinate: originCoord,
    origin_note: "",

    // Destination
    destination_contact_name: customer.recipientName,
    destination_contact_phone: customer.phoneNumber,
    destination_contact_email: "customer@example.com",
    destination_address: isPickup ? "AMBIL DI TOKO" : customer.address,
    destination_coordinate: destinationCoord,
    destination_note: "",

    order_note: "",
  };
}

export async function POST(request: Request) {
  try {
    const frontendPayload = await request.json();
    console.log("[API Route] Menerima payload frontend:", frontendPayload);

    const backendPayload = transformPayloadForBackend(frontendPayload);

    console.log(
      "[API Route] Mengirim payload ke Backend:",
      JSON.stringify(backendPayload, null, 2)
    );

    const response = await fetch(EXTERNAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(backendPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API Route] Backend Error:", data);
      return NextResponse.json(
        { message: data.message || "Gagal memproses pesanan di backend" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Route] Internal Error:", error);
    return NextResponse.json(
      { message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relation = searchParams.get('relation');
    
    // Build URL with query parameters
    const url = new URL(EXTERNAL_API_URL);
    if (relation) {
      url.searchParams.append('relation', relation);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('[API Route] Error fetching orders:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch orders',
        data: [] 
      },
      { status: 500 }
    );
  }
}

