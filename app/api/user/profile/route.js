
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connect from '@/utils/db';
import { User } from '@/Model/User';

export async function PUT(req) {
    try {
        // Verify the current authenticated session.
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json(
                { message: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const image = body?.image;

        if (typeof image !== 'string' || !image.trim()) {
            return NextResponse.json(
                { message: 'Image URL is required.' },
                { status: 400 }
            );
        }

        const imageUrl = image.trim();

        // Validate the URL format and allow HTTPS only.
        let parsedUrl;

        try {
            parsedUrl = new URL(imageUrl);
        } catch {
            return NextResponse.json(
                { message: 'Please provide a valid image URL.' },
                { status: 400 }
            );
        }

        if (parsedUrl.protocol !== 'https:') {
            return NextResponse.json(
                { message: 'Image URL must use HTTPS.' },
                { status: 400 }
            );
        }

        await connect();

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email.trim().toLowerCase() },
            { $set: { image: imageUrl } },
            {
                new: true,
                runValidators: true,
                projection: {
                    _id: 1,
                    username: 1,
                    email: 1,
                    image: 1,
                    role: 1,
                },
            }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { message: 'User not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                message: 'Profile image updated successfully.',
                user: {
                    id: updatedUser._id.toString(),
                    username: updatedUser.username,
                    email: updatedUser.email,
                    image: updatedUser.image,
                    role: updatedUser.role,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error updating profile image:', error);

        return NextResponse.json(
            { message: 'Internal server error.' },
            { status: 500 }
        );
    }
}
