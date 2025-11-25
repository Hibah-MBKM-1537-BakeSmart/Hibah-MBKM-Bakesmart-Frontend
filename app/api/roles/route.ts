import { NextRequest, NextResponse } from "next/server";

const host = process.env.API_HOST;
const port = process.env.API_PORT;
const BACKEND_URL = `http://${host}:${port}`;

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/roles`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    // If unauthorized or not found, return empty array
    if (
      response.status === 401 ||
      response.status === 403 ||
      response.status === 404
    ) {
      console.warn(
        `/roles endpoint returned ${response.status}. Returning empty data.`
      );
      return NextResponse.json(
        {
          success: true,
          message: "Roles endpoint not available yet",
          data: [],
        },
        { status: 200 }
      );
    }

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Backend returns { message, data } format
    // Transform to { success: true, message, data } for consistency
    const result = {
      success: true,
      message: data.message || "Roles retrieved",
      data: data.data || [],
    };

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch roles",
        data: [],
      },
      { status: 500 }
    );
  }
}
