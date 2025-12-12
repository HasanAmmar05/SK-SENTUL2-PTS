"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";
import { Lock, Users } from "lucide-react";
import { SchoolPayLogo } from "@/components/school-pay-logo";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ClassLoginPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // All available classes
  const classes = [
    "1A",
    "1B",
    "2A",
    "2B",
    "3A",
    "3B",
    "4A",
    "4B",
    "5A",
    "5B",
    "6A",
    "6B",
  ];

  const handleClassLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!selectedClass || !password) {
      setError("Please select a class and enter the password.");
      setLoading(false);
      return;
    }

    try {
      // 1. Map to class-specific account
      const email = `class${selectedClass.toLowerCase()}@sksentul2.com`;

      // 2. Attempt login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Login error:", authError);
        setError("Invalid password or class account not found.");
        setLoading(false);
        return;
      }

      // 3. Verify role and active status
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Authentication failed.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "teacher") {
        setError("This account does not have teacher access.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      if (!profile.is_active) {
        setError("This class account is currently inactive.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // 4. Success - redirect to dashboard with class param
      router.push(`/teacher/dashboard?class=${selectedClass}`);
    } catch (err) {
      console.error("Unexpected login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col group/design-root overflow-x-hidden bg-[var(--background-color-teacher)]">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="teacher" activePath="/teacher/class-login" />
        <main className="flex flex-1 items-center justify-center py-10 px-4 sm:px-0">
          <div className="layout-content-container flex flex-col w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="size-10 text-[var(--primary-color-teacher)]">
                <SchoolPayLogo size={40} color="var(--primary-color-teacher)" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-[var(--text-primary-teacher)] tracking-tight text-2xl sm:text-3xl font-bold leading-tight mb-2">
                Class Login
              </h2>
              <p className="text-sm text-[var(--text-secondary-teacher)]">
                Select your class and enter the shared password to access the
                dashboard.
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleClassLogin}>
              <div>
                <label
                  className="block text-sm font-medium text-[var(--text-primary-teacher)] pb-1.5"
                  htmlFor="class"
                >
                  Select Class
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {classes.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`h-10 text-sm rounded-lg border font-medium transition-all ${
                        selectedClass === cls
                          ? "border-[var(--primary-color-teacher)] bg-blue-50 text-[var(--primary-color-teacher)] ring-1 ring-[var(--primary-color-teacher)]"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[var(--text-primary-teacher)] pb-1.5"
                  htmlFor="password"
                >
                  Class Password
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[var(--text-secondary-teacher)]" />
                  <input
                    className="form-input-teacher flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg h-12 placeholder:text-[var(--text-secondary-teacher)] p-3 text-base font-normal leading-normal"
                    id="password"
                    name="password"
                    placeholder="Enter shared password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary-teacher w-full flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Access Dashboard"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center border-t border-slate-100 pt-6">
              <p className="text-sm text-[var(--text-secondary-teacher)] mb-3">
                Need to log in with a personal account?
              </p>
              <Link
                href="/teacher/login"
                className="text-sm font-medium text-[var(--primary-color-teacher)] hover:text-blue-700 transition-colors"
              >
                Go to Teacher Personal Login
              </Link>
            </div>
          </div>
        </main>
        <MainFooter userType="teacher" activePath="/teacher/class-login" />
      </div>
    </div>
  );
}
