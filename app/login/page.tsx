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
    <div className="relative flex min-h-screen flex-col group/design-root overflow-x-hidden bg-slate-100">
      <div className="flex h-full grow flex-col">
        <MainHeader userType="auth" activePath="/login" />
        <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl">
            <div>
              <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
                Welcome Back
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600">
                Sign in to access your account
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 pb-1.5"
                  htmlFor="identifier"
                >
                  IC Number or Email
                </label>
                <div className="flex items-center gap-2">
                  <Badge className="text-slate-400 w-5 h-5 flex-shrink-0" />
                  <input
                    className="form-input block w-full rounded-md border-slate-300 bg-slate-50 py-2 pr-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    id="identifier"
                    name="identifier"
                    placeholder="IC Number (Parents) or Email (Staff)"
                    required
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Parents: Enter 12-digit IC. Staff: Enter Email.
                </p>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-slate-700 pb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="text-slate-400 w-5 h-5 flex-shrink-0" />
                  <input
                    className="form-input block w-full rounded-md border-slate-300 bg-slate-50 py-2 pr-3 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    className="font-medium text-blue-600 hover:text-blue-500"
                    href="/forgot-password"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
            <div>
              <button
                className="flex w-full justify-center rounded-md border border-transparent bg-orange-500 py-3 px-4 text-sm font-semibold text-white shadow-sm  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                onClick={() => router.push("/teacher/login")}
              >
                {"Teacher Login"}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">
                  New parent?
                </span>
              </div>
            </div>

            <p className="text-center text-sm text-slate-600">
              <Link
                className="font-medium text-blue-600 hover:text-blue-500"
                href="/register"
              >
                Register as a parent
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
