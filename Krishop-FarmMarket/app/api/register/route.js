
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

import { User } from '@/Model/User';
import connect from '@/utils/db';

export async function POST(request) {
    try {
        await connect();

        const body = await request.json();

        const username =
            typeof body.username === 'string'
                ? body.username.trim()
                : '';

        const email =
            typeof body.email === 'string'
                ? body.email.trim().toLowerCase()
                : '';

        const password = body.password;

        const role =
            typeof body.role === 'string'
                ? body.role.trim().toLowerCase()
                : 'buyer';

        // Validate required fields.
        if (
            username.length < 2 ||
            username.length > 80 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ) {
            return NextResponse.json(
                {
                    message: 'Enter a valid username and email.',
                },
                { status: 400 }
            );
        }

        if (
            typeof password !== 'string' ||
            password.length < 6 ||
            password.length > 128
        ) {
            return NextResponse.json(
                {
                    message:
                        'Password must be between 6 and 128 characters long.',
                },
                { status: 400 }
            );
        }

        // Public registration may create farmers or buyers only.
        // Admin and vendor roles cannot be assigned through this endpoint.
        if (!['farmer', 'buyer'].includes(role)) {
            return NextResponse.json(
                {
                    message: 'Choose either farmer or buyer.',
                },
                { status: 400 }
            );
        }

        // Prevent duplicate email addresses and usernames.
        const existingUser = await User.findOne({
            $or: [
                { email },
                { username },
            ],
        }).lean();

        if (existingUser) {
            const duplicateField =
                existingUser.email === email
                    ? 'email'
                    : 'username';

            return NextResponse.json(
                {
                    message:
                        duplicateField === 'email'
                            ? 'An account with this email already exists.'
                            : 'This username is already taken.',
                },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
        });

        return NextResponse.json(
            {
                message: 'Account created successfully.',
                user: {
                    id: newUser._id.toString(),
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        // Handle duplicate-key errors, including concurrent registrations.
        if (error?.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];

            return NextResponse.json(
                {
                    message:
                        field === 'username'
                            ? 'This username is already taken.'
                            : 'An account with this email or username already exists.',
                },
                { status: 409 }
            );
        }

        console.error('Registration error:', error);

        return NextResponse.json(
            { message: 'Unable to create account. Please try again.' },
            { status: 500 }
        );
    }
}
