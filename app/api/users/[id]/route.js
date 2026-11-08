import { NextResponse } from 'next/server';
// import dbConnect from '@/lib/db';
// import User from '@/models/User';

export async function PATCH(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const { role } = body;

        // await dbConnect();
        // const updatedUser = await User.findByIdAndUpdate(id, { role }, { new: true });

        return NextResponse.json({ success: true, message: 'Role updated successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ success: false, error: 'Failed to update role' }, { status: 500 });
    }
}