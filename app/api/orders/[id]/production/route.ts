import { NextRequest, NextResponse } from "next/server";
import { createAuthHeaders } from "@/lib/api/fetchWithAuth";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { production_status } = body;

        if (!production_status) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'production_status is required',
                },
                { status: 400 }
            );
        }

        // Validate production_status value
        const validStatuses = ['in_production', 'completed'];
        if (!validStatuses.includes(production_status)) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: `production_status must be one of: ${validStatuses.join(', ')}`,
                },
                { status: 400 }
            );
        }

        console.log('[Order Production API] Updating production status:', params.id, 'to', production_status);

        const response = await fetch(`${BACKEND_URL}/orders/${params.id}/production`, {
            method: 'PUT',
            headers: createAuthHeaders(request),
            body: JSON.stringify({ production_status }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Order Production API] Backend error:', response.status, errorData);
            throw new Error(
                errorData.message || `Backend responded with status: ${response.status}`
            );
        }

        const data = await response.json();
        console.log('[Order Production API] Production status updated:', params.id);

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('[Order Production API] Error:', error);
        return NextResponse.json(
            {
                status: 'error',
                message: error instanceof Error ? error.message : 'Failed to update production status',
            },
            { status: 500 }
        );
    }
}
