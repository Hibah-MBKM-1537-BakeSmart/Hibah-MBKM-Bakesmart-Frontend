import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * POST /api/orders/[id]/finish
 * Finish order and confirm shipping via Biteship. Sends WhatsApp notification to customer.
 * 
 * Backend Documentation (POST /orders/{id}/finish):
 * - Changes order status to 'completed'
 * - If order uses Biteship, confirms with Biteship
 * - Sends WhatsApp notification to customer phone number if available
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        console.log('[Order Finish API] Finishing order:', params.id);

        const response = await fetch(`${BACKEND_URL}/orders/${params.id}/finish`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Order Finish API] Backend error:', response.status, errorData);
            throw new Error(
                errorData.message || `Backend responded with status: ${response.status}`
            );
        }

        const data = await response.json();
        console.log('[Order Finish API] Order finished successfully:', params.id);

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('[Order Finish API] Error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to finish order',
            },
            { status: 500 }
        );
    }
}
