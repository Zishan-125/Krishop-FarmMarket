import { NextResponse } from 'next/server';
import connect from '@/utils/db';
import { Product } from '@/Model/Product';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
    try {
        await connect();
        const resolvedParams = await params;
        const id = resolvedParams.id;

        // "new" athoba kono invalid ObjectId ashle shathe shathe 400 return korbe
        if (!id || id === 'new' || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid or reserved product ID' }, { status: 400 });
        }

        const product = await Product.findById(id).lean();
        if (!product) {
            return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error('Error fetching product detail:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}