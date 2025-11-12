'use client'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout} 
      className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-100"
    >
      <LogOut size={16} />
      <span>Logout</span>
    </Button>
  )
}