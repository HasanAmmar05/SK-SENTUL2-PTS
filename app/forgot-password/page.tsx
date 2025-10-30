'use client';

import { useState } from 'react';
import { supabaseBrowser } from "../../lib/supabase-browser-old";
import { MainHeader } from '@/components/main-header';


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const supabase = supabaseBrowser();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (e: any) {
      setErr(e.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header matching site design */}
      <MainHeader/>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-8">
        <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
        <h1 className="text-2xl font-semibold text-gray-900">Forgot password</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your email and we’ll send you a reset link.
        </p>

        {sent ? (
          <div className="mt-6 rounded-md bg-green-50 p-4 text-green-800">
            Check your inbox for a password reset link.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {err && (
              <p className="text-sm text-red-600">{err}</p>
            )}

            <button
              disabled={loading}
              className="w-full rounded-md bg-blue-600 py-2.5 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <a href="/login" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Back to login
        </a>
      </div>
    </div>
    </>
  );
}