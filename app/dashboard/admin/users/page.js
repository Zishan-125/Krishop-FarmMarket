'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredUsers(users);
        } else {
            const query = searchQuery.toLowerCase();
            setFilteredUsers(
                users.filter(
                    (u) =>
                        (u.username && u.username.toLowerCase().includes(query)) ||
                        (u.email && u.email.toLowerCase().includes(query))
                )
            );
        }
    }, [searchQuery, users]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/users');
            const userData = res.data.users || res.data || [];
            setUsers(userData);
            setFilteredUsers(userData);
        } catch (err) {
            console.error('Failed to load users:', err);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.patch(`/api/users/${userId}`, { role: newRole });
            toast.success(`User role updated to ${newRole}`);
            fetchUsers();
        } catch (err) {
            console.error('Failed to update role:', err);
            toast.error('Failed to update role');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border rounded-lg px-4 py-2 text-sm w-full sm:w-72 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading users...</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg border shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-100 text-gray-800 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">Username</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Current Role</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u._id || u.id} className="hover:bg-gray-50 transition">
                                        <td className="p-4 font-medium text-gray-900">{u.username || 'N/A'}</td>
                                        <td className="p-4">{u.email || 'N/A'}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold capitalize">
                                                {u.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <select
                                                value={u.role || 'user'}
                                                onChange={(e) => handleRoleChange(u._id || u.id, e.target.value)}
                                                className="border rounded px-2 py-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-green-600"
                                            >
                                                <option value="user">Customer</option>
                                                <option value="vendor">Vendor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}