'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { MainHeader } from '@/components/main-header';

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ Handle the new Supabase reset flow (?code=...)
  useEffect(() => {
    const verifyResetLink = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        if (!code) {
          throw new Error('Invalid or expired reset link.');
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;

        setVerifying(false);
      } catch (err) {
        console.error('Reset verification error:', err);
        setError('Invalid or expired reset link. Please request a new one.');
        setVerifying(false);
      }
    };

    verifyResetLink();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Verifying your reset link...
      </div>
    );
  }

  return (
    <>
      <MainHeader userType="auth" />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Reset Password</h1>
          <p className="mt-1 text-sm text-gray-600">
            Enter your new password below.
          </p>

          {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>}
          {success && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
              Password updated successfully! Redirecting...
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
