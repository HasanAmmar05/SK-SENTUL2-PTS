"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, BarChart2, Settings, HelpCircle, Monitor } from "lucide-react"

interface NavLink {
  name: string
  href: string
  icon: React.ElementType
}

const navLinks: NavLink[] = [
  { name: "Dashboard", href: "/teacher/dashboard", icon: Home },
  { name: "Payments", href: "/teacher/payments", icon: CreditCard },
  { name: "Reports", href: "#", icon: BarChart2 },
  { name: "Settings", href: "#", icon: Settings },
]

const utilityLinks: NavLink[] = [
  { name: "Help", href: "#", icon: HelpCircle },
]

export function TeacherSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full min-h-screen w-72 flex-col border-r border-[var(--border-color-teacher)] bg-white p-6">
      <div className="flex flex-col gap-y-6">
        <h1 className="text-[var(--text-primary-teacher)] text-xl font-semibold leading-normal">SK SENTUL 2</h1>
        <nav className="flex flex-col gap-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              className={`nav-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-[var(--text-secondary-teacher)] transition-colors ${
                pathname === link.href ? "nav-item-active-teacher" : "hover:bg-[var(--secondary-color-teacher)]"
              }`}
              href={link.href}
            >
              <link.icon
                className={`w-6 h-6 ${pathname === link.href ? "text-[var(--primary-color-teacher)]" : "text-[var(--text-secondary-teacher)] group-hover:text-[var(--primary-color-teacher)]"}`}
              />
              <p className="text-sm leading-normal">{link.name}</p>
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto flex flex-col gap-y-2">
        {utilityLinks.map((link) => (
          <Link
            key={link.name}
            className={`nav-item flex items-center gap-3 rounded-lg px-3 py-2.5 text-[var(--text-secondary-teacher)] transition-colors ${
              pathname === link.href ? "nav-item-active-teacher" : "hover:bg-[var(--secondary-color-teacher)]"
            }`}
            href={link.href}
          >
            <link.icon
              className={`w-6 h-6 ${pathname === link.href ? "text-[var(--primary-color-teacher)]" : "text-[var(--text-secondary-teacher)] group-hover:text-[var(--primary-color-teacher)]"}`}
            />
            <p className="text-sm leading-normal">{link.name}</p>
          </Link>
        ))}
      </div>
    </aside>
  )
}
