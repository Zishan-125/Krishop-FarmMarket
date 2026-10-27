
import { NextResponse } from 'next/server';
import { User } from '@/Model/User';
import connect from '@/utils/db';
import bcrypt from 'bcryptjs';

export const POST = async (request) => {
  try {
    await connect();
    const { username, email, password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return NextResponse.json(
        { message: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Error creating user', error: error.message },
      { status: 500 }
    );
  }
};
