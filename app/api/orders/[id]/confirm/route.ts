import { NextRequest, NextResponse } from "next/server";

const host = process.env.API_HOST || 'localhost';
const port = process.env.API_PORT || '5000';
const BACKEND_URL = `http://${host}:${port}`;

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log('[Order Confirm API] Confirming order:', params.id);

        const response = await fetch(`${BACKEND_URL}/orders/${params.id}/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Order Confirm API] Backend error:', response.status, errorData);
            throw new Error(
                errorData.message || `Backend responded with status: ${response.status}`
            );
        }

        const data = await response.json();
        console.log('[Order Confirm API] Order confirmed:', params.id);

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('[Order Confirm API] Error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to confirm order',
            },
            { status: 500 }
        );
    }
}
