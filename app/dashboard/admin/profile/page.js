'use client';

import { useSession } from 'next-auth/react';
import React from 'react';

const UserProfile = () => {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div className="p-8">Loading profile...</div>;
    }

    if (status === 'unauthenticated') {
        return <div className="p-8">Please log in to view your profile.</div>;
    }

    const user = session.user;

    const avatar = (
        <div className="w-24 h-24 rounded-full bg-blue-500 text-white flex items-center justify-center text-4xl font-bold uppercase">
            {user?.name?.charAt(0)}
        </div>
    );

    return (
        <div className="font-sans max-w-2xl mx-auto my-8 p-8 border border-gray-300 rounded-lg shadow-md">
            <div className="flex flex-col items-center mb-8">
                {avatar}
                <h1 className="mt-4 text-2xl font-semibold text-gray-800">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
            </div>
            <div>
                <h2 className="text-xl font-semibold border-b-2 border-blue-500 pb-2 mb-4 text-blue-500">Profile Details</h2>
                <div className="mb-4">
                    <strong className="text-gray-800">Username:</strong>
                    <p className="my-2 p-3 bg-gray-100 rounded">{user?.name}</p>
                </div>
                <div className="mb-4">
                    <strong className="text-gray-800">Email Address:</strong>
                    <p className="my-2 p-3 bg-gray-100 rounded">{user?.email}</p>
                </div>
                <div className="mb-4">
                    <strong className="text-gray-800">Role:</strong>
                    <p className="my-2 p-3 bg-gray-100 rounded capitalize">{user?.role || 'user'}</p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
