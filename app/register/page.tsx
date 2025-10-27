"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { MainHeader } from "@/components/main-header"
import { PlusCircle, MinusCircle, AlertCircle, CheckCircle2 } from "lucide-react"
import { validateMalaysianIC } from "@/lib/auth-utils"

interface ChildInfo {
  id: number
  name: string
  grade: string
}

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [children, setChildren] = useState<ChildInfo[]>([{ id: 1, name: "", grade: "" }])
  const [nextChildId, setNextChildId] = useState(2)
  const [icNumber, setIcNumber] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const addChild = () => {
    setChildren([...children, { id: nextChildId, name: "", grade: "" }])
    setNextChildId(nextChildId + 1)
  }

  const removeChild = (idToRemove: number) => {
    if (children.length > 1) {
      setChildren(children.filter((child) => child.id !== idToRemove))
    }
  }

  const handleChildChange = (id: number, field: keyof ChildInfo, value: string) => {
    setChildren(children.map((child) => (child.id === id ? { ...child, [field]: value } : child)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    // Validation
    if (!validateMalaysianIC(icNumber)) {
      setError("Invalid IC number format. Please enter a valid 12-digit Malaysian IC number.")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!")
      setIsLoading(false)
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      setIsLoading(false)
      return
    }

    // Check if all children have names and grades
    const incompleteChildren = children.filter((child) => !child.name || !child.grade)
    if (incompleteChildren.length > 0) {
      setError("Please fill in all children's information.")
      setIsLoading(false)
      return
    }

    try {
      const cleanIC = icNumber.replace(/[\s-]/g, "")

      // 1. Check if IC or email already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("ic_number, email")
        .or(`ic_number.eq.${cleanIC},email.eq.${email}`)
        .single()

      if (existingProfile) {
        if (existingProfile.ic_number === cleanIC) {
          setError("This IC number is already registered.")
        } else {
          setError("This email is already registered.")
        }
        setIsLoading(false)
        return
      }

    // 2. Create auth user
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName,
      ic_number: cleanIC,
    },
  },
})

if (signUpError) {
  setError(signUpError.message)
  setIsLoading(false)
  return
}

// ✅ Immediately fetch the user again (works even if email verification pending)
const { data: { user }, error: userError } = await supabase.auth.getUser()

if (userError || !user) {
  setError("Failed to fetch user information after sign-up. Please try again.")
  setIsLoading(false)
  return
}

// 3. Create profile
const { error: profileError } = await supabase.from("profiles").insert({
  id: user.id, // ✅ always safe now
  ic_number: cleanIC,
  email,
  full_name: fullName,
  phone: phoneNumber,
  role: "parent",
  is_active: true,
})

if (profileError) {
  console.error("Profile insert error:", profileError)
  setError("Failed to create profile. Please contact support.")
  setIsLoading(false)
  return
}

// 4. Add children
const childrenData = children.map((child) => ({
  parent_id: user.id, // ✅ same fetched user ID
  student_name: child.name,
  student_grade: child.grade,
}))

const { error: childrenError } = await supabase.from("parent_students").insert(childrenData)

if (childrenError) {
  console.error("Children insert error:", childrenError)
  setError("Failed to add children information. Please contact support.")
  setIsLoading(false)
  return
}

      // Success!
      setSuccess("Registration successful! Please check your email to verify your account, then you can log in.")

      // Clear form
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      console.error("Registration error:", err)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="auth" activePath="/register" />
        <main className="flex flex-1 justify-center py-8 sm:py-12 px-4 sm:px-6">
          <div className="layout-content-container flex flex-col w-full max-w-2xl py-5 space-y-6">
            <h2 className="text-[var(--text-primary-register)] text-3xl font-bold leading-tight tracking-tight text-center">
              Parent Registration
            </h2>

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

            {success && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>

                <div>
                  <label className="form-label-register" htmlFor="fullName">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="form-input-register h-12 p-3.5 bg-[var(--bg-input-register)]"
                    id="fullName"
                    placeholder="Enter your full name as per IC"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label-register" htmlFor="icNumber">
                    IC Number (MyKad) <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="form-input-register h-12 p-3.5 bg-[var(--bg-input-register)]"
                    id="icNumber"
                    placeholder="XXXXXX-XX-XXXX"
                    type="text"
                    required
                    value={icNumber}
                    onChange={(e) => setIcNumber(e.target.value)}
                    maxLength={14}
                  />
                  <p className="mt-1 text-xs text-slate-500">Enter your 12-digit IC number (e.g., 900101-01-1234)</p>
                </div>

                <div>
                  <label className="form-label-register" htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="form-input-register h-12 p-3.5 bg-[var(--bg-input-register)]"
                    id="email"
                    placeholder="your.email@example.com"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label-register" htmlFor="phoneNumber">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="form-input-register h-12 p-3.5 bg-[var(--bg-input-register)]"
                    id="phoneNumber"
                    placeholder="01X-XXX XXXX"
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label-register" htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="form-input-register h-12 p-3.5 bg-[var(--bg-input-register)]"
                    id="password"
                    placeholder="At least 8 characters"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label-register" htmlFor="confirmPassword">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="form-input-register h-12 p-3.5 bg-[var(--bg-input-register)]"
                    id="confirmPassword"
                    placeholder="Re-enter your password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t border-[var(--border-color-register)] pt-6">
                <h3 className="text-[var(--text-primary-register)] text-xl font-semibold leading-tight tracking-tight mb-4">
                  Children's Information
                </h3>
                <div className="space-y-6" id="children-container">
                  {children.map((child, index) => (
                    <div
                      key={child.id}
                      className="child-entry space-y-3 border border-[var(--border-color-register)] p-4 rounded-lg bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[var(--text-secondary-register)]">Child {index + 1}</p>
                        {children.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 remove-child-btn"
                            onClick={() => removeChild(child.id)}
                          >
                            <MinusCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="form-label-register" htmlFor={`childName${child.id}`}>
                          Child's Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="form-input-register h-12 p-3.5 bg-white"
                          id={`childName${child.id}`}
                          placeholder="Enter child's full name"
                          type="text"
                          required
                          value={child.name}
                          onChange={(e) => handleChildChange(child.id, "name", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="form-label-register" htmlFor={`grade${child.id}`}>
                          Grade <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="form-input-register h-12 p-3.5 bg-white appearance-none"
                          id={`grade${child.id}`}
                          required
                          value={child.grade}
                          onChange={(e) => handleChildChange(child.id, "grade", e.target.value)}
                          style={{
                            backgroundImage:
                              "url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 strokeLinecap=%27round%27 strokeLinejoin=%27round%27 strokeWidth=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e')",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.75rem center",
                            backgroundSize: "1.25em 1.25em",
                          }}
                        >
                          <option value="">Select grade</option>
                          <option value="1">Grade 1</option>
                          <option value="2">Grade 2</option>
                          <option value="3">Grade 3</option>
                          <option value="4">Grade 4</option>
                          <option value="5">Grade 5</option>
                          <option value="6">Grade 6</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="btn-secondary-register mt-4 w-full flex items-center justify-center gap-2 hover:bg-slate-200"
                  id="add-child-btn"
                  type="button"
                  onClick={addChild}
                >
                  <PlusCircle className="w-5 h-5" />
                  <span className="truncate">Add Another Child</span>
                </button>
              </div>

              <button
                className="btn-primary-register w-full mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                <span className="truncate">{isLoading ? "Registering..." : "Register"}</span>
              </button>
            </form>

            <p className="text-center text-sm text-[var(--text-secondary-register)]">
              Already have an account?{" "}
              <Link className="font-medium text-[var(--primary-color-register)] hover:underline" href="/login">
                Log in
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
