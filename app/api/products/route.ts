import { NextResponse } from "next/server";

// Alamat API eksternal kamu.
// Jika alamat ini berubah, kamu CUKUP ganti di satu tempat ini saja.
const EXTERNAL_API_URL = "http://192.168.68.116:5000/products";

/**
 * Ini adalah Route Handler (API internal di Next.js).
 * Dia akan dipanggil ketika ada request GET ke '/api/products'.
 */
export async function GET(request: Request) {
  try {
    console.log(`[API Route] Menerima request ke /api/products`);
    console.log(`[API Route] Mengambil data dari: ${EXTERNAL_API_URL}`);

    // Kita fetch ke API eksternal DARI SISI SERVER.
    // 'cache: 'no-store'' penting agar data selalu fresh (tidak di-cache oleh Next.js)
    const response = await fetch(EXTERNAL_API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Jika API eksternal error, kita teruskan errornya
      console.error(`[API Route] Error dari API eksternal: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(
      `[API Route] Sukses mengambil data, mengirim response ke client.`
    );

    // Kirim data kembali ke client (MenuGrid.tsx)
    return NextResponse.json(data);
  } catch (error) {
    console.error("[API Route] Terjadi kesalahan:", error);
    // Tangani jika terjadi error saat fetch
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
