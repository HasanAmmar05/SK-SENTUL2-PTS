'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function ResetPasswordPage() {
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    // If Supabase sent a "code" param, exchange it for a session (newer flows)
    const code = sp.get('code');
    const work = async () => {
      try {
        const supabase = supabaseBrowser();
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }
        setReady(true);
      } catch (e: any) {
        setErr(e.message ?? 'Could not verify reset link.');
      }
    };
    work();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw1.length < 8) return setErr('Password must be at least 8 characters.');
    if (pw1 !== pw2) return setErr('Passwords do not match.');
    setLoading(true);
    setErr(null);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) throw error;
      // Success → route to login
      router.push('/login?reset=success');
    } catch (e: any) {
      setErr(e.message ?? 'Unable to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Set a new password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter and confirm your new password.
        </p>

        {!ready ? (
          <p className="mt-6 text-sm text-gray-600">Checking reset link…</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New password</label>
              <input
                type="password"
                required
                minLength={8}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type="password"
                required
                minLength={8}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
              />
            </div>

            {err && <p className="text-sm text-red-600">{err}</p>}

            <button
              disabled={loading}
              className="w-full rounded-md bg-blue-600 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}

        <a href="/login" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to login
        </a>
      </div>
    </div>
  );
}
