
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (status === 'loading') {
            setRedirecting(false);
            return;
        }

        if (status === 'unauthenticated' || !session?.user) {
            router.replace('/login');
            return;
        }

        const role = session.user.role?.toLowerCase();

        if (!role) {
            console.error(
                'User role is missing from the NextAuth session.'
            );
            setRedirecting(false);
            return;
        }

        const dashboardRoutes = {
            admin: '/dashboard/admin',
            vendor: '/dashboard/products',
            buyer: '/dashboard/buyer',
            farmer: '/dashboard/farmer',
            user: '/dashboard/user',
            customer: '/dashboard/user',
        };

        const destination = dashboardRoutes[role];

        if (!destination) {
            console.error('Unrecognized user role:', role);
            setRedirecting(false);
            return;
        }

        setRedirecting(true);
        router.replace(destination);
    }, [session, status, router]);

    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
            {status !== 'authenticated' || redirecting ? (
                <>
                    <div
                        className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-green-700"
                        aria-hidden="true"
                    />
                    <p className="font-medium text-gray-600">
                        {redirecting
                            ? 'Redirecting to your dashboard...'
                            : 'Loading session data...'}
                    </p>
                </>
            ) : (
                <div className="text-center">
                    <p className="font-medium text-red-600">
                        Your account role could not be verified.
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                        Please sign out and sign in again. If the problem
                        continues, contact the administrator.
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
