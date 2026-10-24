import Link from 'next/link';

export default function PaymentFailPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
            <h1 className="text-4xl font-bold text-red-700 mb-4">Payment Failed</h1>
            <p className="text-lg text-gray-700 mb-8">Something went wrong with your transaction.</p>
            <Link href="/" className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
                Go to Home
            </Link>
        </div>
    );
}
