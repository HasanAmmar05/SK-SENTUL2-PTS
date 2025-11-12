import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Malaysian IC number validation
export function validateMalaysianIC(icNumber: string): boolean {
  // Remove any spaces or dashes
  const cleanIC = icNumber.replace(/[\s-]/g, "")

  // Must be exactly 12 digits
  if (!/^\d{12}$/.test(cleanIC)) {
    return false
  }

  // Extract date parts (YYMMDD)
  const year = Number.parseInt(cleanIC.substring(0, 2))
  const month = Number.parseInt(cleanIC.substring(2, 4))
  const day = Number.parseInt(cleanIC.substring(4, 6))

  // Validate month (01-12)
  if (month < 1 || month > 12) {
    return false
  }

  // Validate day (01-31)
  if (day < 1 || day > 31) {
    return false
  }

  return true
}

// Format IC number (add dashes for display)
export function formatICNumber(icNumber: string): string {
  const clean = icNumber.replace(/[\s-]/g, "")
  if (clean.length === 12) {
    return `${clean.substring(0, 6)}-${clean.substring(6, 8)}-${clean.substring(8, 12)}`
  }
  return icNumber
}

// Generate temporary password
export function generateTemporaryPassword(): string {
  const length = 12
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
  let password = ""

  // Ensure at least one of each type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]
  password += "0123456789"[Math.floor(Math.random() * 10)]
  password += "!@#$%^&*"[Math.floor(Math.random() * 8)]

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

// Get user profile with role
export async function getUserProfile(userId: string) {
  const supabase = createClientComponentClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return null
  }

  return data
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const profile = await getUserProfile(userId)
  return profile?.role === "admin"
}

// Get redirect path based on role
export function getRedirectPathForRole(role: string): string {
  switch (role) {
    case "parent":
      return "/parent/dashboard"
    case "teacher":
      return "/teacher/dashboard"
    case "treasurer":
      return "/treasurer/dashboard"
    case "admin":
      return "/admin/dashboard"
    default:
      return "/login"
  }
}
