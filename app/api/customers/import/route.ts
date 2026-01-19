import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { message: "Excel file is required" },
        { status: 400 }
      );
    }

    // Create a new FormData to forward to backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    // Get auth token from request headers
    const authToken = request.headers.get("Authorization");
    const headers: HeadersInit = {};
    if (authToken) {
      headers["Authorization"] = authToken;
    }

    const response = await fetch(`${BACKEND_URL}/customers/import`, {
      method: "POST",
      headers,
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Backend responded with status: ${response.status}`
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error importing customers:", error);
    return NextResponse.json(
      { message: "Failed to import customers", error: String(error) },
      { status: 500 }
    );
  }
}
