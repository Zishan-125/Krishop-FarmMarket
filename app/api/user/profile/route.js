import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connect from '@/utils/db';
import { User } from '@/Model/User';

export async function PUT(req) {
    try {
        const session = await getServerSession();
        
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connect();
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ message: 'Image URL is required' }, { status: 400 });
        }

        // Update the user's profile image in MongoDB
        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            { $set: { image } },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(
            { message: 'Profile updated successfully', user: updatedUser }, 
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating profile image:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}