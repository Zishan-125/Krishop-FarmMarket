'use client'
import { useSession } from 'next-auth/react';
import React, { useEffect } from 'react'

const Dashboard = () => {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.role) {
            window.location.href = `/dashboard/${session.user.role}`;
        }
    }, [session]);

    return (
        <div>Redirecting to the appropriate dashboard...</div>
    )
}

export default Dashboard
