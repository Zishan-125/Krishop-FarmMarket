'use client';
import React, { useState } from 'react';
import Swal from 'sweetalert2';

const PaymentModal = ({ onPaymentSubmit, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                <h2 className="text-xl font-semibold mb-4">Pay with SSLCommerz</h2>
                <div className="mb-6 text-gray-700">
                    <p>You will be redirected to the SSLCommerz secure payment gateway to complete your purchase.</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <button
                        className="flex-1 bg-green-700 hover:bg-green-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        onClick={onPaymentSubmit}
                    >
                        Pay Now
                    </button>
                    <button
                        className="flex-1 bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
