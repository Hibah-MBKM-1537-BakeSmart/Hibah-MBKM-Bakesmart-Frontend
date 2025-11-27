import { NextResponse } from "next/server";

const host = process.env.API_HOST || "localhost";
const port = process.env.API_PORT || "5000";
const BACKEND_IMPORT_URL = `http://${host}:${port}/users/import`;

export async function POST(request: Request) {
  try {
    // Expecting multipart/form-data with field name 'file'
    const form = await request.formData();

    const file = form.get('file');
    if (!file) {
      return NextResponse.json({ message: 'File is required' }, { status: 400 });
    }

    // Build a form to forward to backend
    const forward = new FormData();
    forward.append('file', file as any);

    const response = await fetch(BACKEND_IMPORT_URL, {
      method: 'POST',
      body: forward,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[API Users Import] Backend Error:', data);
      return NextResponse.json({ message: data.message || 'Failed to import users' }, { status: response.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('[API Users Import] Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
