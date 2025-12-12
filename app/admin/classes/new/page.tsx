"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2, School } from "lucide-react";
import { addClassAccount } from "@/app/admin/actions";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AddClassPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [formData, setFormData] = useState({
    className: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const availableClasses = [
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

  useEffect(() => {
    const checkAdminAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!profile || profile.role !== "admin") {
        router.push("/login");
      }
    };
    checkAdminAccess();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!formData.className || !formData.password) {
        setError("Please select a class and enter a password");
        setIsLoading(false);
        return;
    }

    try {
      const result = await addClassAccount(formData.className, formData.password);

      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result.success) {
        setSuccess(
          `Class ${formData.className} account created successfully!`
        );

        // Reset form after 2 seconds
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      }
    } catch (err) {
      console.error("Add class error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <School className="w-6 h-6" />
                Add New Class Account
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Create a dedicated login for a class
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-200">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 border border-green-200">
            <div className="flex">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Class Name
                </label>
                <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    required
                >
                    <option value="">Select a class</option>
                    {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                            {cls}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password
                </label>
                <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />
                <p className="text-xs text-slate-500 mt-1">
                    This password will be used to login for Class {formData.className || "..."}
                </p>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isLoading ? "Creating..." : "Create Class Account"}
            </button>
        </form>
      </main>
    </div>
  );
}