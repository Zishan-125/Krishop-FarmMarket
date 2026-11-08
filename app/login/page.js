'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email: email.trim().toLowerCase(),
                password,
            });

            if (!result || result.error || !result.ok) {
                setError('Invalid email or password.');
                setLoading(false);
                return;
            }

            // Fetch the authenticated session to read the actual role.
            const response = await fetch('/api/auth/session', {
                method: 'GET',
                cache: 'no-store',
            });

            if (!response.ok) {
                setError('Login succeeded, but your session could not be verified. Please try again.');
                setLoading(false);
                return;
            }

            const session = await response.json();

            if (!session?.user) {
                setError('Your session could not be verified. Please try logging in again.');
                setLoading(false);
                return;
            }

            // Normalize role to lowercase to avoid case-sensitivity bugs
            const role = session.user.role ? session.user.role.toLowerCase() : 'user';

            let dashboardPath;

            // Map all registered roles explicitly to their specific dashboards
            if (role === 'farmer') {
                dashboardPath = '/dashboard/farmer';
            } else if (role === 'admin') {
                dashboardPath = '/dashboard/admin';
            } else if (role === 'vendor') {
                dashboardPath = '/dashboard/products'; // Matches your backend dashboardRoutes mapping
            } else if (role === 'buyer') {
                dashboardPath = '/dashboard/buyer';
            } else {
                dashboardPath = '/dashboard/user';
            }

            // Respect only safe, local callback URLs.
            const callbackUrl = searchParams.get('callbackUrl');

            const safeCallbackUrl =
                callbackUrl &&
                callbackUrl.startsWith('/') &&
                !callbackUrl.startsWith('//') &&
                !callbackUrl.includes('\\')
                    ? callbackUrl
                    : null;

            const canUseCallback =
                safeCallbackUrl &&
                (
                    safeCallbackUrl === dashboardPath ||
                    safeCallbackUrl.startsWith(`${dashboardPath}/`)
                );

            router.replace(
                canUseCallback ? safeCallbackUrl : dashboardPath
            );

            router.refresh();
        } catch (err) {
            console.error('Login error:', err);
            setError('Something went wrong while logging in. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-md p-8">
            <h1 className="mb-4 text-2xl font-bold">Login</h1>

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="mb-1 block"
                    >
                        Email
                    </label>

                    <input
                        type="email"
                        id="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full rounded border p-2"
                    />
                </div>

                <div className="mb-4">
                    <label
                        htmlFor="password"
                        className="mb-1 block"
                    >
                        Password
                    </label>

                    <input
                        type="password"
                        id="password"
                        name="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="w-full rounded border p-2"
                    />
                </div>

                {error && (
                    <p
                        role="alert"
                        className="mb-4 text-sm text-red-600"
                    >
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-green-700 p-2 text-white transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}