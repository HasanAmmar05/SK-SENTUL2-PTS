"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { SchoolPayLogo } from "./school-pay-logo"
import { Bell, Menu, X } from "lucide-react"
import LogoutButton from "./logout-button"

interface NavLink {
  name: string
  href: string
  isActive?: boolean
}

interface MainHeaderProps {
  userType: "parent" | "treasurer" | "auth" | "teacher" | "admin"
  activePath?: string
}

export function MainHeader({ userType, activePath }: MainHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getNavLinks = (type: string): NavLink[] => {
    if (type === "parent") {
      return [
        { name: "Dashboard", href: "/parent/dashboard" },
        { name: "Payments", href: "/parent/payment" },
        { name: "Reports", href: "#" },
        { name: "Settings", href: "#" },
      ]
    } else if (type === "treasurer") {
      return [
        { name: "Dashboard", href: "/treasurer/dashboard" },
        { name: "Pending Payments", href: "/treasurer/pending-payments" },
        { name: "Historical Payments", href: "/treasurer/historical-payments" },
        { name: "Settings", href: "#" },
      ]
    } else if (type === "teacher") {
      return [
        { name: "Dashboard", href: "/teacher/dashboard" },
        { name: "Payments", href: "/teacher/payments" },
        { name: "Reports", href: "#" },
        { name: "Settings", href: "#" },
      ]
    } else if (type === "admin") {
      return [
        { name: "Dashboard", href: "/admin/dashboard" },
        { name: "Staff Management", href: "/admin/staff-management" },
        { name: "Reports", href: "#" },
        { name: "Settings", href: "#" },
      ]
    }
    return []
  }

  const navLinks = getNavLinks(userType)

  const profileImage =
    userType === "parent"
      ? "/images/profile-parent.png"
      : userType === "treasurer"
        ? "/images/profile-treasurer.png"
        : userType === "teacher"
          ? "/placeholder.svg?height=40&width=40" // Placeholder for teacher profile
          : userType === "admin"
            ? "/placeholder.svg?height=40&width=40"
            : null

  const logoColor =
    userType === "treasurer" && activePath === "/treasurer/login"
      ? "var(--primary-color-treasurer-login)"
      : userType === "treasurer" && activePath === "/treasurer/payment-details"
        ? "var(--primary-color-treasurer-details)"
        : userType === "parent" && activePath === "/login"
          ? "var(--primary-color-parent-login)"
          : userType === "parent" && activePath === "/register"
            ? "var(--primary-color-register)"
            : userType === "parent" && activePath === "/parent/payment"
              ? "var(--primary-color-parent-payment)"
              : userType === "parent" && activePath === "/parent/dashboard"
                ? "var(--primary-color-parent-info)"
                : userType === "treasurer" && activePath === "/treasurer/pending-payments"
                  ? "var(--primary-color-treasurer-pending)"
                  : userType === "treasurer" && activePath === "/treasurer/historical-payments"
                    ? "var(--primary-color-historical)"
                    : userType === "teacher"
                      ? "var(--primary-color-teacher)" // Teacher specific color
                      : userType === "admin"
                        ? "var(--primary-color-admin)" // Admin specific color
                        : "var(--primary-color-parent-login)" // Default for other cases

  const textColor =
    userType === "treasurer" && activePath === "/treasurer/login"
      ? "var(--text-color-treasurer-login)"
      : userType === "treasurer" && activePath === "/treasurer/payment-details"
        ? "var(--text-primary-treasurer-details)"
        : userType === "parent" && activePath === "/login"
          ? "text-slate-800"
          : userType === "parent" && activePath === "/register"
            ? "var(--text-primary-register)"
            : userType === "parent" && activePath === "/parent/payment"
              ? "text-slate-900"
              : userType === "parent" && activePath === "/parent/dashboard"
                ? "var(--text-primary-parent-info)"
                : userType === "treasurer" && activePath === "/treasurer/pending-payments"
                  ? "var(--text-primary-treasurer-pending)"
                  : userType === "treasurer" && activePath === "/treasurer/historical-payments"
                    ? "var(--text-primary-historical)"
                    : userType === "teacher"
                      ? "var(--text-primary-teacher)" // Teacher specific color
                      : userType === "admin"
                        ? "var(--text-primary-admin)" // Admin specific color
                        : "text-slate-800" // Default for other cases

  const borderColor =
    userType === "treasurer" && activePath === "/treasurer/login"
      ? "var(--border-color-treasurer-login)"
      : userType === "treasurer" && activePath === "/treasurer/payment-details"
        ? "var(--border-color-treasurer-details)"
        : userType === "parent" && activePath === "/login"
          ? "border-b-slate-200"
          : userType === "parent" && activePath === "/register"
            ? "var(--border-color-register)"
            : userType === "parent" && activePath === "/parent/payment"
              ? "border-slate-200"
              : userType === "parent" && activePath === "/parent/dashboard"
                ? "var(--border-color-parent-info)"
                : userType === "treasurer" && activePath === "/treasurer/pending-payments"
                  ? "var(--border-light-treasurer-pending)"
                  : userType === "treasurer" && activePath === "/treasurer/historical-payments"
                    ? "var(--border-color-historical)"
                    : userType === "teacher"
                      ? "var(--border-color-teacher)" // Teacher specific color
                      : userType === "admin"
                        ? "var(--border-color-admin)" // Admin specific color
                        : "border-slate-200" // Default for other cases

  const bgColor =
    userType === "treasurer" && activePath === "/treasurer/login"
      ? "bg-white"
      : userType === "treasurer" && activePath === "/treasurer/payment-details"
        ? "bg-white"
        : userType === "parent" && activePath === "/login"
          ? "bg-white"
          : userType === "parent" && activePath === "/register"
            ? "bg-white"
            : userType === "parent" && activePath === "/parent/payment"
              ? "bg-white"
              : userType === "parent" && activePath === "/parent/dashboard"
                ? "bg-white"
                : userType === "treasurer" && activePath === "/treasurer/pending-payments"
                  ? "bg-white"
                  : userType === "treasurer" && activePath === "/treasurer/historical-payments"
                    ? "bg-[var(--card-background-color-historical)]"
                    : userType === "teacher"
                      ? "bg-white" // Teacher specific color
                      : userType === "admin"
                        ? "bg-white" // Admin specific color
                        : "bg-white" // Default for other cases

  return (
    <header
      className={`flex items-center justify-between whitespace-nowrap border-b border-solid ${borderColor} px-6 sm:px-10 py-4 shadow-sm ${bgColor}`}
    >
      <div className={`flex items-center gap-3 sm:gap-4 ${textColor}`}>
        <SchoolPayLogo
          size={userType === "treasurer" && activePath === "/treasurer/payment-details" ? 28 : 24}
          color={logoColor}
        />
        <h2
          className={`text-xl sm:text-2xl font-bold leading-tight tracking-tight ${
            userType === "treasurer" && activePath === "/treasurer/dashboard" ? "tracking-[-0.015em]" : ""
          }`}
        >
          SK SENTUL 2
        </h2>
      </div>

      {userType !== "auth" && (
        <>
          <nav
            className={`hidden ${
              userType === "treasurer" && activePath === "/treasurer/payment-details"
                ? "flex-1 justify-center items-center gap-8"
                : "flex-1 justify-end items-center gap-6 sm:gap-8"
            } sm:flex`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium leading-normal transition-colors ${
                  activePath === link.href
                    ? userType === "treasurer" && activePath === "/treasurer/payment-details"
                      ? "text-[var(--text-primary-treasurer-details)] nav-link-active-treasurer-details font-semibold"
                      : userType === "parent" && activePath === "/parent/payment"
                        ? "text-[var(--primary-color-parent-payment)] font-semibold"
                        : userType === "parent" && activePath === "/parent/dashboard"
                          ? "text-[var(--primary-color-parent-info)] font-semibold border-b-2 border-[var(--primary-color-parent-info)] pb-1"
                          : userType === "treasurer" && activePath === "/treasurer/pending-payments"
                            ? "nav-link-active-treasurer-pending"
                            : userType === "treasurer" && activePath === "/treasurer/historical-payments"
                              ? "active-nav-link-historical"
                              : userType === "teacher"
                                ? "text-[var(--primary-color-teacher)] font-semibold border-b-2 border-[var(--primary-color-teacher)] pb-1" // Teacher active style
                                : userType === "admin"
                                  ? "text-[var(--primary-color-admin)] font-semibold border-b-2 border-[var(--primary-color-admin)] pb-1" // Admin active style
                                  : "text-[var(--primary-color-treasurer-dashboard)]"
                    : userType === "treasurer" && activePath === "/treasurer/payment-details"
                      ? "text-[var(--text-secondary-treasurer-details)] hover:text-[var(--primary-color-treasurer-details)]"
                      : userType === "parent" && activePath === "/parent/payment"
                        ? "text-slate-600 hover:text-[var(--primary-color-parent-payment)]"
                        : userType === "parent" && activePath === "/parent/dashboard"
                          ? "text-[var(--text-secondary-parent-info)] hover:text-[var(--primary-color-parent-info)]"
                          : userType === "treasurer" && activePath === "/treasurer/pending-payments"
                            ? "text-[var(--text-secondary-treasurer-pending)] hover:text-[var(--primary-color-treasurer-pending)]"
                            : userType === "treasurer" && activePath === "/treasurer/historical-payments"
                              ? "nav-link-historical text-[var(--text-secondary-historical)]"
                              : userType === "teacher"
                                ? "text-[var(--text-secondary-teacher)] hover:text-[var(--primary-color-teacher)]" // Teacher hover style
                                : userType === "admin"
                                  ? "text-[var(--text-secondary-admin)] hover:text-[var(--primary-color-admin)]" // Admin hover style
                                  : "text-slate-600 hover:text-[var(--primary-color-treasurer-dashboard)]"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4 ml-6">
            {/* Only show logout button for authenticated user types */}
            {(userType === "parent" || userType === "treasurer" || userType === "teacher" || userType === "admin") && 
              activePath !== "/login" && activePath !== "/register" && (
                <LogoutButton />
              )
            }
            {userType === "treasurer" && activePath === "/treasurer/payment-details" && (
              <button className="relative text-[var(--text-secondary-treasurer-details)] hover:text-[var(--primary-color-treasurer-details)] transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-color-treasurer-details)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary-color-treasurer-details)]"></span>
                </span>
              </button>
            )}
            {userType === "treasurer" && activePath === "/treasurer/pending-payments" && (
              <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-[var(--secondary-color-treasurer-pending)]">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
            )}
            {profileImage && (
              <Image
                src={profileImage || "/placeholder.svg"}
                alt="Profile"
                width={40}
                height={40}
                className={`bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 ${
                  userType === "treasurer" && activePath === "/treasurer/login"
                    ? "border-[var(--primary-color-treasurer-login)]"
                    : userType === "treasurer" && activePath === "/treasurer/payment-details"
                      ? "border-[var(--primary-color-treasurer-details)]"
                      : userType === "parent" && activePath === "/parent/payment"
                        ? "ml-4 border-slate-200 shadow-sm"
                        : userType === "parent" && activePath === "/parent/dashboard"
                          ? "border-[var(--border-color-parent-info)]"
                          : userType === "treasurer" && activePath === "/treasurer/dashboard"
                            ? "border-slate-200 hover:border-[var(--primary-color-treasurer-dashboard)] transition-all"
                            : userType === "treasurer" && activePath === "/treasurer/pending-payments"
                              ? "border-slate-200"
                              : userType === "treasurer" && activePath === "/treasurer/historical-payments"
                                ? "border-[var(--primary-color-historical)]"
                                : userType === "teacher"
                                  ? "border-[var(--border-color-teacher)]"
                                  : userType === "admin"
                                    ? "border-[var(--border-color-admin)]"
                                    : ""
                }`}
              />
            )}
          </div>

          <div className="sm:hidden">
            <button
              className="text-[var(--text-color-treasurer-login)] focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </>
      )}

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md sm:hidden z-10">
          <nav className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-2 text-sm font-medium transition-colors ${
                  activePath === link.href
                    ? "text-[var(--primary-color-treasurer-login)]"
                    : userType === "teacher"
                      ? "text-[var(--text-primary-teacher)] hover:text-[var(--primary-color-teacher)]" // Teacher mobile menu style
                      : userType === "admin"
                        ? "text-[var(--text-primary-admin)] hover:text-[var(--primary-color-admin)]" // Admin mobile menu style
                        : "text-[var(--text-color-treasurer-login)] hover:text-[var(--primary-color-hover-treasurer-login)]"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> 1154ffb2c22266ec59215616f3cd37d698bd5526
