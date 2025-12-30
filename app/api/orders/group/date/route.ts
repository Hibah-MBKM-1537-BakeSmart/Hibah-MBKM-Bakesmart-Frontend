import { NextRequest, NextResponse } from "next/server";

const host = process.env.API_HOST || 'localhost';
const port = process.env.API_PORT || '5000';
const BACKEND_URL = `http://${host}:${port}`;

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

        const response = await fetch(`${BACKEND_URL}/orders/group/date`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
