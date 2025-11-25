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

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    console.log('[Admin API] GET request for ID:', id);
    
    const response = await fetch(`${BACKEND_URL}/admins/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[Admin API] Backend error:', response.status);
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Admin API] Backend response:', data);
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Admin retrieved',
      data: data.data ? transformAdminData(data.data) : null
    });
  } catch (error) {
    console.error('[Admin API] GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch admin'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('[Admin API] PUT request for ID:', id, 'Body:', body);
    
    const response = await fetch(`${BACKEND_URL}/admins/${id}`, {
      method: 'PUT',
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
    console.log('[Admin API] PUT success:', data);
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Admin updated successfully',
      data: data.data ? transformAdminData(data.data) : null
    });
  } catch (error) {
    console.error('[Admin API] PUT error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to update admin'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    console.log('[Admin API] DELETE request for ID:', id);
    
    const response = await fetch(`${BACKEND_URL}/admins/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Admin API] DELETE success:', data);
    
    return NextResponse.json({
      success: true,
      message: data.message || 'Admin deleted successfully',
      data: null
    });
  } catch (error) {
    console.error('[Admin API] DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to delete admin'
      },
      { status: 500 }
    );
  }
}