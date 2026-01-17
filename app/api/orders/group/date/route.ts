import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { date } = body;

        if (!date) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Date is required',
                    data: null,
                },
                { status: 400 }
            );
        }

        console.log('[Orders Group Date API] Fetching orders for date:', date);

        // Get auth headers
        const authHeaders = createAuthHeaders(request);

        const response = await fetch(`${BACKEND_URL}/orders/group/date`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ date }),
        });

        if (!response.ok) {
            console.error('[Orders Group Date API] Backend error:', response.status);
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[Orders Group Date API] Received data for date:', date);

        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('[Orders Group Date API] Error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch orders by date',
                data: null,
            },
            { status: 500 }
        );
    }
}
