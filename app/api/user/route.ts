import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest) {
    const body = await req.json();

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${req.cookies.get('access_token')?.value}`,
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        // Create response
        const res = new NextResponse(
            JSON.stringify({
                success: response.ok,
                message: response.ok
                    ? 'Profile updated successfully!'
                    : result.message || `Request failed with status ${response.status}`,
                data: response.ok ? result.user : undefined,
            }),
            {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            }
        );

    
        if (response.ok) {
            res.cookies.delete('isProfileCompleted')
        }    
        return res;
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error.message || 'Failed to update profile',
            },
            { status: 500 }
        );
    }
}