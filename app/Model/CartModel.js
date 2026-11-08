import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
});

const cartSchema = new mongoose.Schema({
    items: [itemSchema],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending',
    },
    val_id: {
        type: String,
    },
});

const OrderedItems = mongoose.models.OrderedItems || mongoose.model("OrderedItems", cartSchema);

export default OrderedItems;
