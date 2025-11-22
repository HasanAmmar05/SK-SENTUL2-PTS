"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"
import { User, Lock } from "lucide-react"
import { SchoolPayLogo } from "@/components/school-pay-logo"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function TeacherLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter both Email and Password.")
      return
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError("Invalid email or password.")
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError("Authentication failed. Please try again.")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role, is_active").eq("id", user.id).single()
    if (!profile || profile.role !== "teacher") {
      setError("You do not have teacher access.")
      await supabase.auth.signOut()
      return
    }
    if (!profile.is_active) {
      setError("Your account has been deactivated. Please contact administrator.")
      await supabase.auth.signOut()
      return
    }

    router.push("/teacher/dashboard")
  }

  return (
    <div className="relative flex min-h-screen flex-col group/design-root overflow-x-hidden bg-[var(--background-color-teacher)]">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="teacher" activePath="/teacher/login" />
        <main className="flex flex-1 items-center justify-center py-10 px-4 sm:px-0">
          <div className="layout-content-container flex flex-col w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="size-10 text-[var(--primary-color-teacher)]">
                <SchoolPayLogo size={40} color="var(--primary-color-teacher)" />
              </div>
            </div>
            <h2 className="text-[var(--text-primary-teacher)] tracking-tight text-2xl sm:text-3xl font-bold leading-tight text-center mb-8">
              Teacher Login
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-medium text-[var(--text-primary-teacher)] pb-1.5"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--text-secondary-teacher)]" />
                  <input
                    className="form-input-teacher flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg h-12 placeholder:text-[var(--text-secondary-teacher)] p-3 text-base font-normal leading-normal"
                    id="email"
                    name="email"
                    placeholder="email@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-[var(--text-primary-teacher)] pb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[var(--text-secondary-teacher)]" />
                  <input
                    className="form-input-teacher flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg h-12 placeholder:text-[var(--text-secondary-teacher)] p-3 text-base font-normal leading-normal"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="pt-2">
                <button type="submit" className="btn-primary-teacher w-full flex justify-center items-center">
                  <span className="truncate">Login</span>
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <Link
                className="text-sm text-[var(--text-secondary-teacher)] hover:text-[var(--primary-color-teacher)] transition-colors"
                href="#"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </main>
        <MainFooter userType="teacher" activePath="/teacher/login" />
      </div>
    </div>
  )
}
