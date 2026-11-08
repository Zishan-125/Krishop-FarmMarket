import { NextResponse } from 'next/server';
import connect from '@/utils/db';
import { Product } from '@/app/Model/Product';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(request) {
    try {
        await connect();
        const { searchParams } = new URL(request.url);
        const vendorId = searchParams.get('vendor');

        let query = {};
        if (vendorId) query.vendor = vendorId;

        const products = await Product.find(query).sort({ createdAt: -1 }).lean();

        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connect();
        
        const contentType = request.headers.get('content-type') || '';
        let productData = {};

        // Handle multipart/form-data (when uploading files from device)
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            
            productData.title = formData.get('title');
            productData.category = formData.get('category');
            productData.price = formData.get('price');
            productData.stock = formData.get('stock');
            productData.unit = formData.get('unit');
            productData.location = formData.get('location');
            productData.storeName = formData.get('storeName');
            productData.description = formData.get('description');

            const imageFile = formData.get('image');
            if (imageFile && typeof imageFile === 'object' && imageFile.name) {
                const bytes = await imageFile.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Save image locally to public/uploads directory
                const filename = `${Date.now()}-${imageFile.name.replaceAll(' ', '_')}`;
                const uploadDir = path.join(process.cwd(), 'public/uploads', filename);
                await writeFile(uploadDir, buffer);

                productData.image = `/uploads/${filename}`;
            }
        } else {
            // Handle standard JSON requests
            productData = await request.json();
        }

        const newProduct = await Product.create(productData);

        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ message: error.message || 'Error creating product' }, { status: 500 });
    }
}