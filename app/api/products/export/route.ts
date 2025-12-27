import { NextResponse } from "next/server";

const host = process.env.API_HOST || "localhost";
const port = process.env.API_PORT || "5000";
const EXTERNAL_API_URL = `http://${host}:${port}/products/export`;

export async function GET(request: Request) {
  try {
    console.log(`[Products Export API] GET export from: ${EXTERNAL_API_URL}`);

    const response = await fetch(EXTERNAL_API_URL, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[Products Export API] Error: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const blob = await response.blob();
    const headers = new Headers();
    headers.set("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    headers.set("Content-Disposition", 'attachment; filename="products.xlsx"');

    return new NextResponse(blob, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("[Products Export API] Error:", error);
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
}
