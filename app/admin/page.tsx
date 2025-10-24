import { redirect } from "next/navigation"

export default function AdminPage() {
  // Redirect to login - admins use the same login page
  redirect("/login")
}
