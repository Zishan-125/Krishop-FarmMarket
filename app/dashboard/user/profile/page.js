'use client';

import { useSession } from 'next-auth/react';
import React, { useState } from 'react';
import axios from 'axios';
import { Camera, CheckCircle2, User, Mail, ShieldCheck } from 'lucide-react';

const UserProfile = () => {
    const { data: session, status, update } = useSession();
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setSuccessMessage('');
        setErrorMessage('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            // 1. Upload image file to local storage via API
            const uploadRes = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (uploadRes.status === 200) {
                const newImageUrl = uploadRes.data.url;
                setProfileImage(newImageUrl);

                // 2. Save profile image URL to user document in database
                await axios.put('/api/user/profile', { image: newImageUrl });

                // 3. Sync image update with active NextAuth session
                await update({ 
                    ...session, 
                    user: { ...session?.user, image: newImageUrl } 
                });

                setSuccessMessage('Profile picture updated successfully!');
            }
        } catch (err) {
            console.error('Failed to upload profile picture:', err);
            setErrorMessage('Failed to upload profile picture. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (status === 'loading') {
        return <div className="p-8 text-gray-600 font-medium">Loading profile...</div>;
    }

    if (status === 'unauthenticated') {
        return <div className="p-8 text-red-600 font-semibold">Please log in to view your profile.</div>;
    }

    const user = session?.user;
    const currentAvatar = profileImage || user?.image;

    return (
        <div className="font-sans max-w-2xl mx-auto my-8 p-8 border border-gray-200 rounded-2xl shadow-sm bg-white">
            {/* Header / Avatar Upload Section */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative w-28 h-28">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md bg-emerald-600 text-white flex items-center justify-center text-4xl font-bold uppercase">
                        {currentAvatar ? (
                            <img 
                                src={currentAvatar} 
                                alt={user?.name || 'Profile'} 
                                className="w-full h-full object-cover" 
                            />
                        ) : (
                            user?.name?.charAt(0) || 'A'
                        )}
                    </div>

                    {/* Camera Button for Device Image Upload */}
                    <label className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-full cursor-pointer shadow-lg transition">
                        <Camera className="w-4 h-4" />
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleProfilePicUpload} 
                            className="hidden" 
                        />
                    </label>
                </div>

                {/* Upload Status Feedback */}
                {uploading && <p className="mt-3 text-xs text-emerald-600 font-medium animate-pulse">Uploading new image...</p>}
                {successMessage && (
                    <div className="mt-3 flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
                        <CheckCircle2 className="w-4 h-4" /> {successMessage}
                    </div>
                )}
                {errorMessage && (
                    <p className="mt-3 text-red-500 text-sm font-medium">{errorMessage}</p>
                )}

                <h1 className="mt-4 text-2xl font-semibold text-gray-800">{user?.name}</h1>
                <p className="text-gray-600">{user?.email}</p>
            </div>

            {/* Profile Details Section */}
            <div>
                <h2 className="text-xl font-semibold border-b-2 border-emerald-500 pb-2 mb-4 text-emerald-600">Profile Details</h2>
                
                <div className="mb-4">
                    <strong className="text-gray-800 flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-500" /> Username:
                    </strong>
                    <p className="my-2 p-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-800 font-medium">{user?.name}</p>
                </div>

                <div className="mb-4">
                    <strong className="text-gray-800 flex items-center gap-2 mb-1">
                        <Mail className="w-4 h-4 text-gray-500" /> Email Address:
                    </strong>
                    <p className="my-2 p-3 bg-gray-100/70 border border-gray-100 rounded-xl text-gray-800 font-medium">{user?.email}</p>
                </div>

                <div className="mb-4">
                    <strong className="text-gray-800 flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" /> Role:
                    </strong>
                    <p className="my-2 p-3 bg-gray-50 border border-gray-100 rounded-xl capitalize text-emerald-700 font-semibold">
                        {user?.role || 'user'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;