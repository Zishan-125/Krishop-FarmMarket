import { NextResponse } from 'next/server';
import { User } from '@/app/Model/User';
import connect from '@/utils/db';
import bcrypt from 'bcryptjs';

export const POST = async (request) => {
    try {
        await connect();

        const { username, email, password, role } = await request.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                { message: 'Username, email, and password are required' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { message: 'Password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        const userExists = await User.findOne({
            email: normalizedEmail,
        });

        if (userExists) {
            return NextResponse.json(
                { message: 'User with this email already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Safely map role, defaulting to 'user' if none provided
        const userRole = role ? role.toLowerCase() : 'user';

        const newUser = new User({
            username: username.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole,
        });

        await newUser.save();

        return NextResponse.json(
            { message: 'User created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Registration error:', error);

        return NextResponse.json(
            { message: 'Error creating user' },
            { status: 500 }
        );
    }
};