import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
    try {
        console.log('[Orders Group API] Fetching order groups from backend');

        const response = await fetch(`${BACKEND_URL}/orders/group`, {
            method: 'GET',
            headers: createAuthHeaders(request),
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error('[Orders Group API] Backend error:', response.status);
            throw new Error(`Backend responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log('[Orders Group API] Received', data.data?.length || 0, 'order groups');

        return NextResponse.json(data, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('[Orders Group API] Error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to fetch order groups',
                data: [],
            },
            { status: 500 }
        );
    }
}
