'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user'); // Added role state with default 'user'
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!username || !email || !password || !role) {
            setError('All fields are required');
            return;
        }

        try {
            const user = { username, email, password, role }; // Included role in payload
            await axios.post('/api/register', user);
            setSuccess('Registration successful! Redirecting to login...');
            
            // 1.5 second pore automatic login page-e redirect korbe
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'An unexpected error occurred.');
        }
    };

    return (
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md border my-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="username" className="block mb-1 text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                        placeholder="Enter your username"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                        placeholder="Enter your email"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        minLength={6}
                        required
                        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                        placeholder="••••••••"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="role" className="block mb-1 text-sm font-medium text-gray-700">Select Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-green-600"
                    >
                        <option value="user">Customer / User</option>
                        <option value="farmer">Farmer</option>
                        <option value="buyer">Buyer</option>
                        <option value="vendor">Vendor</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
                {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
                {success && <p className="text-green-600 mb-4 text-sm font-medium">{success}</p>}
                <button type="submit" className="w-full bg-green-700 text-white p-2.5 rounded font-semibold hover:bg-green-900 transition">
                    Register
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;