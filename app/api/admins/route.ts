import { NextRequest, NextResponse } from 'next/server';

const host = process.env.API_HOST || 'localhost';
const port = process.env.API_PORT || '5000';
const BACKEND_URL = `http://${host}:${port}`;

// Role mapping based on backend data (admin roles only)
const ROLE_MAPPING: Record<number, string> = {
  1: 'owner',
  2: 'baker', 
  3: 'cashier',
  4: 'packager'
};

// Transform backend admin data to frontend format
function transformAdminData(backendAdmin: any) {
  return {
    id: backendAdmin.id,
    nama: backendAdmin.nama,
    no_hp: backendAdmin.no_hp,
    role: ROLE_MAPPING[backendAdmin.role_id] || 'unknown',
    role_id: backendAdmin.role_id,
    created_at: backendAdmin.created_at,
    updated_at: backendAdmin.updated_at,
    // Don't expose password to frontend
  };
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Admins API] GET request to:', `${BACKEND_URL}/admins`);
    
    const response = await fetch(`${BACKEND_URL}/admins`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[Admins API] Backend error:', response.status);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Admins API] Backend response:', JSON.stringify(data).substring(0, 200));
    
    // Transform backend data to frontend format
    const transformedData = data.data?.map(transformAdminData) || [];
    
    const result = {
      success: true,
      message: data.message || 'Admins retrieved',
      data: transformedData
    };
    
    console.log('[Admins API] Returning', transformedData.length, 'admins');
    
    return NextResponse.json(result, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('[Admins API] Error:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Admins API] POST request:', body);
    
    const response = await fetch(`${BACKEND_URL}/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Admins API] POST success:', data);
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Admin created successfully',
      data: data.data ? transformAdminData(data.data) : null
    });
  } catch (error) {
    console.error('[Admins API] POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to create admin'
      },
      { status: 500 }
    );
  }
}
