// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    nameBn: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    descriptionBn: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    category: {
        type: String,
        required: true,
        enum: [
            'fertilizers',
            'seeds',
            'tools',
            'pesticides',
            'soil',
            'organic',
            'equipment'
        ]
    },
    categoryBn: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        trim: true
    },
    subcategoryBn: {
        type: String,
        trim: true
    },
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ''
        }
    }],
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    weight: {
        value: {
            type: Number,
            min: 0
        },
        unit: {
            type: String,
            enum: ['g', 'kg', 'pcs', 'packet'],
            default: 'kg'
        }
    },
    brand: {
        type: String,
        trim: true
    },
    sku: {
        type: String,
        unique: true,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    tagsBn: [{
        type: String,
        trim: true
    }],
    specifications: [{
        name: {
            type: String,
            required: true
        },
        value: {
            type: String,
            required: true
        },
        nameBn: {
            type: String
        },
        valueBn: {
            type: String
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    rating: {
        average: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        count: {
            type: Number,
            min: 0,
            default: 0
        }
    },
    discount: {
        type: {
            type: String,
            enum: ['percentage', 'fixed', null],
            default: null
        },
        value: {
            type: Number,
            min: 0,
            default: 0
        },
        startDate: {
            type: Date
        },
        endDate: {
            type: Date
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function () {
    if (this.discount.type === 'percentage') {
        return this.price - (this.price * this.discount.value / 100);
    } else if (this.discount.type === 'fixed') {
        return this.price - this.discount.value;
    }
    return this.price;
});

// Update the updatedAt field before saving
productSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    // Generate SKU if not provided
    if (!this.sku) {
        const prefix = this.category.substring(0, 3).toUpperCase();
        const random = Math.floor(1000 + Math.random() * 9000);
        this.sku = `${prefix}-${random}`;
    }

    next();
});

// Method to check if discount is active
productSchema.methods.isDiscountActive = function () {
    if (!this.discount.type) return false;

    const now = new Date();
    if (this.discount.startDate && now < this.discount.startDate) return false;
    if (this.discount.endDate && now > this.discount.endDate) return false;

    return true;
};
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
