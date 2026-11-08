import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 2,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ['admin', 'user', 'vendor', 'farmer', 'buyer'],
            default: 'user',
            required: true,
        },

        phone: {
            type: String,
            trim: true,
            maxlength: 30,
            default: '',
        },

        district: {
            type: String,
            trim: true,
            maxlength: 80,
            default: '',
        },

        bio: {
            type: String,
            trim: true,
            maxlength: 500,
            default: '',
        },

        businessName: {
            type: String,
            trim: true,
            maxlength: 120,
            default: '',
        },

        image: {
            type: String,
            default: '',
        },
    },
    {
        timestamps: true,
    }
);

// Crucial: Clear cached Mongoose model to prevent stale schema compilation in development
if (mongoose.models.User) {
    delete mongoose.models.User;
}

export const User = mongoose.model('User', userSchema);