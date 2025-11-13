import { NextResponse } from "next/server";

/**
 * INI ADALAH DATABASE VOUCHER MOCK (SEMENTARA)
 * Logika ini kita pindahkan dari VoucherSection.tsx
 *
 * Nanti, Anda tinggal ganti isi fungsi ini untuk 'fetch'
 * ke backend Hapi.js Anda.
 */
const validateVoucherInMockDB = async (
  code: string
): Promise<{
  valid: boolean;
  discount?: number;
  code?: string;
  message?: string;
}> => {
  // Simulasi penundaan jaringan
  await new Promise((resolve) => setTimeout(resolve, 750));

  const mockVouchers: { [key: string]: number } = {
    DISKON10: 10000,
    DISKON20: 20000,
    HEMAT50: 50000,
    GRATIS15: 15000,
  };

  const uppercaseCode = code.toUpperCase();

  if (mockVouchers[uppercaseCode]) {
    // Jika valid
    return {
      valid: true,
      discount: mockVouchers[uppercaseCode],
      code: uppercaseCode,
    };
  }

  // Jika tidak valid
  return { valid: false, message: "Kode voucher tidak valid" };
};

/**
 * Ini adalah API Handler untuk POST /api/vouchers/validate
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { voucherCode } = body;

    if (!voucherCode || typeof voucherCode !== "string") {
      return new NextResponse(
        JSON.stringify({ message: "Kode voucher diperlukan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Panggil fungsi validasi mock kita
    const result = await validateVoucherInMockDB(voucherCode);

    if (!result.valid) {
      // Kirim error 404 (Not Found) jika voucher tidak valid
      return new NextResponse(
        JSON.stringify({
          message: result.message || "Kode voucher tidak valid",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Kirim respons sukses 200 (OK) jika valid
    return NextResponse.json({
      message: "Voucher berhasil diterapkan",
      code: result.code,
      discount: result.discount,
    });
  } catch (error) {
    console.error("[API Route /vouchers] Terjadi kesalahan:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
