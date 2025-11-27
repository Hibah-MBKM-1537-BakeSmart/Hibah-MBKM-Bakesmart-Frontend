import { NextResponse } from "next/server";

const host = process.env.API_HOST || "localhost";
const port = process.env.API_PORT || "5000";
const BACKEND_URL = `http://${host}:${port}/users`;

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[API Users GET by ID] Backend Error:", data);
      return NextResponse.json({ message: data.message || "User not found" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Users GET by ID] Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[API Users PUT] Backend Error:", data);
      return NextResponse.json({ message: data.message || "Failed to update user" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Users PUT] Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const response = await fetch(`${BACKEND_URL}/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("[API Users DELETE] Backend Error:", data);
      return NextResponse.json({ message: data.message || "Failed to delete user" }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Users DELETE] Error:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
