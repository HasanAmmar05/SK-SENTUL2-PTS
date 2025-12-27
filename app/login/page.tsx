"use client";

import type React from "react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { MainHeader } from "@/components/main-header";
import { Badge, Lock, AlertCircle } from "lucide-react";
import { validateMalaysianIC, getRedirectPathForRole } from "@/lib/auth-utils";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const isEmail = identifier.includes("@");

      if (isEmail) {
        // --- EMAIL LOGIN FLOW (Staff/Admin) ---

        // 1️⃣ Authenticate using email and password
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: identifier,
            password,
          });

        if (authError) {
          setError("Invalid email or password. Please try again.");
          setIsLoading(false);
          return;
        }

        // 2️⃣ Check account status
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, is_active")
          .eq("id", authData.user?.id)
          .single();

        if (profile && !profile.is_active) {
          setError(
            "Your account has been deactivated. Please contact administrator."
          );
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        // 3️⃣ Redirect based on role
        if (profile) {
          const redirectPath = getRedirectPathForRole(profile.role);
          router.push(redirectPath);
        } else {
          router.push("/"); // Fallback
        }
      } else {
        // --- IC LOGIN FLOW (Parents) ---

        // Validate IC number format
        if (!validateMalaysianIC(identifier)) {
          setError(
            "Invalid format. Please enter a valid 12-digit IC number or email address."
          );
          setIsLoading(false);
          return;
        }

        const cleanIC = identifier.replace(/[\s-]/g, "");

        // 1️⃣ Find the email linked to this IC
        const { data: profile, error: icError } = await supabase
          .from("profiles")
          .select("email, ic_number, role, is_active, id")
          .eq("ic_number", cleanIC)
          .single();

        if (icError || !profile) {
          setError("IC number not found. Please check again.");
          setIsLoading(false);
          return;
        }

        // 2️⃣ Authenticate using that email and provided password
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: profile.email,
            password,
          });

        if (authError) {
          setError("Invalid password. Please try again.");
          setIsLoading(false);
          return;
        }

        // 3️⃣ Check account status
        if (!profile.is_active) {
          setError(
            "Your account has been deactivated. Please contact administrator."
          );
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        // 4️⃣ Redirect based on role
        const redirectPath = getRedirectPathForRole(profile.role);
        router.push(redirectPath);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <MainHeader userType="auth" activePath="/login" />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
              Welcome Back
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">
              Sign in to access your account
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 p-4 border border-red-100">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="identifier"
                >
                  IC Number or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Badge className="text-slate-400 w-5 h-5" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                    id="identifier"
                    name="identifier"
                    placeholder="IC Number (Parents) or Email (Staff)"
                    required
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">
                  Parents: Enter 12-digit IC. Staff: Enter Email.
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-slate-400 w-5 h-5" />
                  </div>
                  <input
                    className="block w-full pl-10 pr-3 py-2.5 rounded-lg border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                  href="/forgot-password"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <button
                className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In"}
              </button>

              <button
                className="flex w-full justify-center rounded-lg border border-transparent bg-orange-500 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200"
                type="button"
                onClick={() => router.push("/teacher/login")}
              >
                Teacher Login
              </button>
            </div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-slate-500">
                New parent?
              </span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-600">
            <Link
              className="font-semibold text-blue-600 hover:text-blue-500 transition-colors"
              href="/register"
            >
              Register as a parent
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
