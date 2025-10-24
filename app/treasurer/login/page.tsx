"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"

export default function TreasurerLoginPage() {
  const [treasurerId, setTreasurerId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = (e) => {
    e.preventDefault()

    // Simulated authentication (replace with actual API call in production)
    const validTreasurerId = "treasurer123"
    const validPassword = "password123"

    if (treasurerId === validTreasurerId && password === validPassword) {
      setError("")
      router.push("/treasurer/dashboard")
    } else {
      setError("Invalid Treasurer ID or Password")
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col group/design-root overflow-x-hidden bg-[var(--background-color-treasurer-login)]">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="treasurer" activePath="/treasurer/login" />
        <main className="flex flex-1 items-center justify-center py-10 px-4 sm:px-0">
          <div className="layout-content-container flex flex-col w-full max-w-md bg-white p-6 sm:p-8 rounded-xl shadow-xl">
            <div className="flex justify-center mb-6">
              <div className="size-10 text-[var(--primary-color-treasurer-login)]">
                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_6_319_alt_login_icon)">
                    <path
                      d="M8.57829 8.57829C5.52816 11.6284 3.451 15.5145 2.60947 19.7452C1.76794 23.9758 2.19984 28.361 3.85056 32.3462C5.50128 36.3314 8.29667 39.7376 11.8832 42.134C15.4698 44.5305 19.6865 45.8096 24 45.8096C28.3135 45.8096 32.5302 44.5305 36.1168 42.134C39.7033 39.7375 42.4987 36.3314 44.1494 32.3462C45.8002 28.361 46.2321 23.9758 45.3905 19.7452C44.549 15.5145 42.4718 11.6284 39.4217 8.57829L24 24L8.57829 8.57829Z"
                      fill="currentColor"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_6_319_alt_login_icon">
                      <rect fill="white" height="48" width="48"></rect>
                    </clipPath>
                  </defs>
                </svg>
              </div>
            </div>
            <h2 className="text-[var(--text-color-treasurer-login)] tracking-tight text-2xl sm:text-3xl font-bold leading-tight text-center mb-8">
              Treasurer Login
            </h2>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-sm font-medium text-[var(--text-color-treasurer-login)] pb-1.5"
                  htmlFor="treasurer-id"
                >
                  Treasurer ID
                </label>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg h-12 placeholder:text-[var(--muted-text-color-treasurer-login)] p-3 text-base font-normal leading-normal"
                  id="treasurer-id"
                  name="treasurer-id"
                  placeholder="Enter your Treasurer ID"
                  type="text"
                  value={treasurerId}
                  onChange={(e) => setTreasurerId(e.target.value)}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-[var(--text-color-treasurer-login)] pb-1.5"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg h-12 placeholder:text-[var(--muted-text-color-treasurer-login)] p-3 text-base font-normal leading-normal"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full flex justify-center items-center"
                >
                  <span className="truncate">Login</span>
                </button>
              </div>
            </form>
            <div className="mt-6 text-center">
              <Link
                className="text-sm text-[var(--muted-text-color-treasurer-login)] hover:text-[var(--primary-color-hover-treasurer-login)] transition-colors"
                href="#"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </main>
        <MainFooter userType="treasurer" activePath="/treasurer/login" />
      </div>
    </div>
  )
}
