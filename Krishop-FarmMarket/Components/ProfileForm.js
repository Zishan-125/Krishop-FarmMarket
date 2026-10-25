'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

const emptyProfile = { username: '', email: '', phone: '', district: '', businessName: '', bio: '' };

export default function ProfileForm({ role }) {
    const { data: session, status, update } = useSession();
    const [form, setForm] = useState(emptyProfile);
    const [state, setState] = useState({ loading: true, saving: false, message: '', error: '' });

    useEffect(() => {
        if (status !== 'authenticated') return;
        fetch('/api/profile')
            .then(async (response) => {
                const data = await response.json();
                if (!response.ok) throw new Error(data.message || 'Unable to load profile');
                setForm({ ...emptyProfile, ...data.user });
            })
            .catch((error) => setState((current) => ({ ...current, error: error.message })))
            .finally(() => setState((current) => ({ ...current, loading: false })));
    }, [status]);

    function change(event) {
        setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    }

    async function submit(event) {
        event.preventDefault();
        setState((current) => ({ ...current, saving: true, message: '', error: '' }));
        try {
            const response = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unable to update profile');
            setForm({ ...emptyProfile, ...data.user });
            await update({ name: data.user.username });
            setState((current) => ({ ...current, saving: false, message: 'Your profile has been updated.' }));
        } catch (error) {
            setState((current) => ({ ...current, saving: false, error: error.message }));
        }
    }

    if (status === 'loading' || state.loading) return <div className="rounded-2xl border border-[#d6e8d9] bg-white p-8 text-[#5c7564]">Loading your profile...</div>;
    if (status === 'unauthenticated') return <div className="rounded-2xl border border-[#efd6d2] bg-white p-8 text-red-700">Please log in to edit your profile.</div>;

    return (
        <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2f8a52]">Account settings</p>
            <h1 className="mt-2 text-3xl font-bold capitalize text-[#0d542f]">{role} profile</h1>
            <p className="mt-3 text-[#5c7564]">Keep your contact and market details current so KriShop can connect you with the right people.</p>
            {state.error && <p className="mt-5 rounded-lg bg-[#fff0ed] p-3 text-sm text-red-700">{state.error}</p>}
            {state.message && <p className="mt-5 rounded-lg bg-[#e4f6e8] p-3 text-sm font-semibold text-[#176b38]">{state.message}</p>}
            <form onSubmit={submit} className="mt-6 rounded-2xl border border-[#d6e8d9] bg-white p-6 shadow-sm sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-semibold text-[#526d5a]">Full name<input name="username" value={form.username} onChange={change} required className="mt-1 w-full rounded-lg border border-[#d6e8d9] p-3 font-normal text-[#173b27]" /></label>
                    <label className="text-sm font-semibold text-[#526d5a]">Email<input value={form.email} readOnly className="mt-1 w-full rounded-lg border border-[#e5ece6] bg-[#f5f8f5] p-3 font-normal text-[#718078]" /></label>
                    <label className="text-sm font-semibold text-[#526d5a]">Phone<input name="phone" value={form.phone} onChange={change} placeholder="01XXXXXXXXX" className="mt-1 w-full rounded-lg border border-[#d6e8d9] p-3 font-normal text-[#173b27]" /></label>
                    <label className="text-sm font-semibold text-[#526d5a]">District<input name="district" value={form.district} onChange={change} placeholder="e.g. Bogura" className="mt-1 w-full rounded-lg border border-[#d6e8d9] p-3 font-normal text-[#173b27]" /></label>
                    <label className="text-sm font-semibold text-[#526d5a] sm:col-span-2">{role === 'farmer' ? 'Farm or business name' : 'Company or business name'}<input name="businessName" value={form.businessName} onChange={change} className="mt-1 w-full rounded-lg border border-[#d6e8d9] p-3 font-normal text-[#173b27]" /></label>
                    <label className="text-sm font-semibold text-[#526d5a] sm:col-span-2">About you<textarea name="bio" value={form.bio} onChange={change} rows={4} maxLength={500} placeholder={role === 'farmer' ? 'Tell buyers about your farm and produce.' : 'Tell farmers what you usually source.'} className="mt-1 w-full rounded-lg border border-[#d6e8d9] p-3 font-normal text-[#173b27]" /></label>
                </div>
                <button type="submit" disabled={state.saving} className="mt-6 rounded-lg bg-[#0d542f] px-5 py-3 font-bold text-white transition hover:bg-[#174a36] disabled:cursor-not-allowed disabled:opacity-60">{state.saving ? 'Saving...' : 'Save changes'}</button>
            </form>
        </div>
    );
}
