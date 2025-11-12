"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import { addStaffMember } from "@/app/admin/actions"

export default function AddStaffPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    fullName: "",
    icNumber: "",
    email: "",
    phone: "",
    role: "teacher" as "teacher" | "treasurer",
    assignedClasses: [] as string[],
    employeeId: "",
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [tempPassword, setTempPassword] = useState("")

  const availableClasses = ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B", "5A", "5B", "6A", "6B"]

  const handleClassToggle = (className: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(className)
        ? prev.assignedClasses.filter((c) => c !== className)
        : [...prev.assignedClasses, className],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const result = await addStaffMember(formData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      if (result.success && result.tempPassword) {
        setTempPassword(result.tempPassword)
        setSuccess(`Staff member added successfully! Please provide the temporary password to the staff member.`)

        // Reset form after 5 seconds
        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 5000)
      }
    } catch (err) {
      console.error("Add staff error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Add New Staff Member</h1>
              <p className="text-sm text-slate-600 mt-1">Create a new teacher or treasurer account</p>
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
                {tempPassword && (
                  <div className="mt-3 p-3 bg-white rounded border border-green-300">
                    <p className="text-xs text-slate-600 font-medium mb-1">Temporary Password:</p>
                    <p className="text-lg font-mono font-bold text-green-900 select-all">{tempPassword}</p>
                    <p className="text-xs text-slate-600 mt-2">⚠️ Save this password! It won't be shown again.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as "teacher" | "treasurer" })}
                required
              >
                <option value="teacher">Teacher</option>
                <option value="treasurer">Treasurer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter full name as per IC"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                IC Number (MyKad) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="XXXXXX-XX-XXXX"
                value={formData.icNumber}
                onChange={(e) => setFormData({ ...formData, icNumber: e.target.value })}
                maxLength={14}
                required
              />
              <p className="text-xs text-slate-500 mt-1">Format: 12-digit Malaysian IC number</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="01X-XXX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Employee ID</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter employee ID"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </div>
          </div>

          {formData.role === "teacher" && (
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Assigned Classes <span className="text-red-500">*</span>
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {availableClasses.map((className) => (
                  <button
                    key={className}
                    type="button"
                    onClick={() => handleClassToggle(className)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                      formData.assignedClasses.includes(className)
                        ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                        : "border-slate-300 hover:border-slate-400"
                    }`}
                  >
                    {className}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.push("/admin/dashboard")}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Adding Staff..." : "Add Staff Member"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
