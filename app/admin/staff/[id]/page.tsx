"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Key,
} from "lucide-react";
import { resetStaffPassword, deleteStaffMember } from "@/app/admin/actions";

interface StaffData {
  id: string;
  ic_number: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  is_active: boolean;
}

interface TeacherDetails {
  assigned_classes: string[];
}

interface TreasurerDetails {
  access_level: string;
}

export default function EditStaffPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const staffId = params.id as string;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "teacher",
    isActive: true,
    assignedClasses: [] as string[],
    accessLevel: "full",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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
    fetchStaffData();
  }, [staffId]);

  const fetchStaffData = async () => {
    setIsLoading(true);

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", staffId)
      .single();

    if (profileError || !profile) {
      setError("Staff member not found");
      setIsLoading(false);
      return;
    }

    let roleDetails: TeacherDetails | TreasurerDetails | null = null;

    // Fetch role-specific details
    if (profile.role === "teacher") {
      const { data } = await supabase
        .from("teacher_details")
        .select("*")
        .eq("user_id", staffId)
        .single();
      roleDetails = data;
    } else if (profile.role === "treasurer") {
      const { data } = await supabase
        .from("treasurer_details")
        .select("*")
        .eq("user_id", staffId)
        .single();
      roleDetails = data;
    }

    setFormData({
      fullName: profile.full_name,
      email: profile.email,
      phone: profile.phone || "",
      role: profile.role,
      isActive: profile.is_active,
      assignedClasses:
        roleDetails && "assigned_classes" in roleDetails
          ? roleDetails.assigned_classes || []
          : [],
      accessLevel:
        roleDetails && "access_level" in roleDetails
          ? roleDetails.access_level
          : "full",
    });

    setIsLoading(false);
  };

  const handleClassToggle = (className: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(className)
        ? prev.assignedClasses.filter((c) => c !== className)
        : [...prev.assignedClasses, className],
    }));
  };

  const toggleGrade = (gradeNum: string) => {
    const classesInGrade = availableClasses.filter((c) =>
      c.startsWith(gradeNum)
    );
    const allSelected = classesInGrade.every((c) =>
      formData.assignedClasses.includes(c)
    );

    setFormData((prev) => ({
      ...prev,
      assignedClasses: allSelected
        ? prev.assignedClasses.filter((c) => !c.startsWith(gradeNum))
        : [...new Set([...prev.assignedClasses, ...classesInGrade])],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    if (formData.role === "teacher" && formData.assignedClasses.length === 0) {
      setError("Please assign at least one class for the teacher");
      setIsSaving(false);
      return;
    }

    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          is_active: formData.isActive,
        })
        .eq("id", staffId);

      if (profileError) {
        setError("Failed to update profile");
        setIsSaving(false);
        return;
      }

      // Update role-specific details
      if (formData.role === "teacher") {
        const { error: teacherError } = await supabase
          .from("teacher_details")
          .update({
            assigned_classes: formData.assignedClasses,
          })
          .eq("user_id", staffId);

        if (teacherError) {
          setError("Failed to update teacher details");
          setIsSaving(false);
          return;
        }
      } else if (formData.role === "treasurer") {
        const { error: treasurerError } = await supabase
          .from("treasurer_details")
          .update({
            access_level: formData.accessLevel,
          })
          .eq("user_id", staffId);

        if (treasurerError) {
          setError("Failed to update treasurer details");
          setIsSaving(false);
          return;
        }
      }

      setSuccess("Staff member updated successfully!");
      setIsSaving(false);

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Update staff error:", err);
      setError("An unexpected error occurred");
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }

    setIsResettingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    const result = await resetStaffPassword(staffId, newPassword);

    if (result.error) {
      setPasswordError(result.error);
    } else {
      setPasswordSuccess("Password updated successfully!");
      setNewPassword("");
    }

    setIsResettingPassword(false);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this staff member? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Call server action to delete user
      const result = await deleteStaffMember(staffId);

      if (result.error) {
        setError(result.error);
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      console.error("Delete staff error:", err);
      setError("An unexpected error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading staff details...</p>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-slate-900">
                Edit Staff Member
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Update staff information and settings
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6"
        >
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50"
                value={
                  formData.role.charAt(0).toUpperCase() + formData.role.slice(1)
                }
                disabled
              />
              <p className="mt-1 text-xs text-slate-500">
                Role cannot be changed after creation
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-slate-900"
              >
                Account is active
              </label>
            </div>
          </div>

          {formData.role === "teacher" && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Assigned Classes <span className="text-red-500">*</span>
              </h3>

              {/* Quick Select Buttons */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["1", "2", "3", "4", "5", "6"].map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => toggleGrade(grade)}
                    className="px-3 py-1 text-xs font-medium rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    {availableClasses
                      .filter((c) => c.startsWith(grade))
                      .every((c) => formData.assignedClasses.includes(c))
                      ? `Deselect Grade ${grade}`
                      : `Select All Grade ${grade}`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {availableClasses.map((className) => (
                  <button
                    key={className}
                    type="button"
                    onClick={() => handleClassToggle(className)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      formData.assignedClasses.includes(className)
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {className}
                  </button>
                ))}
              </div>
            </div>
          )}

          {formData.role === "treasurer" && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Treasurer Settings
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Access Level
                </label>
                <select
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.accessLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, accessLevel: e.target.value })
                  }
                >
                  <option value="full">Full Access</option>
                  <option value="limited">Limited Access</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Reset Password
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={isResettingPassword || !newPassword}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
                  >
                    {isResettingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>

              {passwordSuccess && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {passwordSuccess}
                </p>
              )}

              {passwordError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {passwordError}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Delete Staff Member
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
