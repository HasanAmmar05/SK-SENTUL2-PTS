import Link from "next/link"
import { redirect } from "next/navigation"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"

export default function HomePage() {
  // Redirect to login page
  redirect("/login")

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-slate-100">
      <div className="flex h-full grow flex-col">
        <MainHeader userType="auth" activePath="/" />
        <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-2xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Welcome to SK SENTUL2 PTS</h1>
            <p className="mt-2 text-sm text-slate-600">Please select your role to continue.</p>
            <div className="space-y-4">
              <Link
                href="/login"
                className="flex w-full justify-center rounded-md border border-transparent bg-[var(--primary-color-parent-login)] py-3 px-4 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-parent-login)] focus:ring-offset-2 transition-colors duration-150"
              >
                Parent Login
              </Link>
              <Link
                href="/treasurer/login"
                className="flex w-full justify-center rounded-md border border-slate-300 bg-white py-3 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-treasurer-login)] focus:ring-offset-2 transition-colors duration-150"
              >
                Treasurer Login
              </Link>
              <Link
                href="/teacher/login"
                className="flex w-full justify-center rounded-md border border-slate-300 bg-white py-3 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-teacher)] focus:ring-offset-2 transition-colors duration-150"
              >
                Teacher Login
              </Link>
            </div>
          </div>
        </main>
        <MainFooter userType="parent" activePath="/" /> {/* Using parent footer for general home page */}
      </div>
    </div>
  )
}
