'use client';

import { useState, useEffect } from 'react';

export default function ProfileForm({ role }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        district: '',
        bio: '',
        businessName: '',
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch current user profile data
        async function fetchProfile() {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        username: data.username || '',
                        email: data.email || '',
                        phone: data.phone || '',
                        district: data.district || '',
                        bio: data.bio || '',
                        businessName: data.businessName || '',
                    });
                }
            } catch (err) {
                console.error('Failed to load profile', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setMessage('Profile updated successfully!');
            } else {
                setMessage('Failed to update profile.');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setMessage('Something went wrong.');
        }
    };

    if (loading) return <div className="p-6">Loading profile...</div>;

    return (
        <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-4 text-xl font-bold capitalize">{role} Profile Settings</h2>

            {message && <div className="mb-4 rounded bg-green-100 p-2 text-green-700">{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="mt-1 w-full rounded border p-2"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="mt-1 w-full rounded border bg-gray-100 p-2 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 w-full rounded border p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">District / Location</label>
                    <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        className="mt-1 w-full rounded border p-2"
                    />
                </div>

                {role === 'farmer' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Farm / Business Name</label>
                        <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            className="mt-1 w-full rounded border p-2"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="3"
                        className="mt-1 w-full rounded border p-2"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full rounded bg-green-600 p-2 text-white hover:bg-green-700 transition"
                >
                    Save Changes
                </button>
            </form>
        </div>
    );
}