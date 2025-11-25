import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:5000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/admins`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    // If unauthorized, return empty array for development
    if (response.status === 401 || response.status === 403) {
      console.warn('Authorization required for /admins endpoint. Returning empty data.');
      return NextResponse.json({
        success: true,
        message: 'Authorization required',
        data: []
      }, { status: 200 });
    }

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Backend returns { message, data } format
    // Transform to { success: true, message, data } for consistency
    const result = {
      success: true,
      message: data.message || 'Admins retrieved',
      data: data.data || []
    };
    
    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch admins',
        data: [] 
      },
      { status: 500 }
    );
  }
}
