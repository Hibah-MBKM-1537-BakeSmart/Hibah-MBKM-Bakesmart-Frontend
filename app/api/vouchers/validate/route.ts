import { NextResponse } from "next/server";

/**
 * Ini adalah API Handler untuk POST /api/vouchers/validate
 * Proxy ke backend: POST http://localhost:5000/voucher/check
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { voucherCode, amount, userId } = body;

    if (!voucherCode) {
      return NextResponse.json(
        { message: "Kode voucher harus diisi" },
        { status: 400 }
      );
    }

    // Panggil backend API
    const backendUrl = "http://localhost:5000/voucher/check";

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: voucherCode,
        amount: amount || 0, // Default 0 jika tidak ada
        userId: userId || 12, // Default 12 sesuai request user jika tidak ada
      }),
    });

    const result = await response.json();
    console.log(
      "[API Validate Voucher] Backend response:",
      JSON.stringify(result, null, 2)
    );

    if (!response.ok) {
      // Jika backend mengembalikan error (4xx, 5xx)
      return NextResponse.json(
        { message: result.message || "Gagal memvalidasi voucher" },
        { status: response.status }
      );
    }

    // Cek status dari response body backend
    if (result.status === "fail") {
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    // Jika sukses
    // Backend response structure might vary.
    // Expected: { status: "success", data: { data: { ...voucher } } }
    // Or maybe: { status: "success", data: { ...voucher } }

    let voucherData = result.data?.data;

    // Fallback: jika result.data langsung berisi object voucher (bukan nested di .data)
    if (!voucherData && result.data) {
      voucherData = result.data;
    }

    if (!voucherData) {
      console.error(
        "[API Validate Voucher] Voucher data not found in response:",
        result
      );
      return NextResponse.json(
        { message: "Terjadi kesalahan: Data voucher tidak ditemukan" },
        { status: 500 }
      );
    }

    // Hitung diskon jika backend tidak mengembalikan nominal diskon langsung
    // Tapi frontend butuh 'discount' (nominal)
    // Asumsi: backend mengembalikan 'persen' atau nominal fix?
    // Di contoh response ada "persen": 10.

    let discountAmount = 0;
    if (voucherData.persen) {
      discountAmount = (amount * voucherData.persen) / 100;
    } else if (voucherData.nominal) {
      discountAmount = voucherData.nominal;
    }

    // Kita kembalikan format yang diharapkan frontend
    return NextResponse.json({
      valid: true,
      code: voucherData.kode || voucherData.code,
      discount: discountAmount,
      voucherId: voucherData.id, // Include voucher ID for order creation
      minPurchase: voucherData.minimal__pembelian || 0, // Include min purchase
      message: result.message,
      details: voucherData, // Kirim data lengkap jika perlu
    });
  } catch (error) {
    console.error("Error validating voucher:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
