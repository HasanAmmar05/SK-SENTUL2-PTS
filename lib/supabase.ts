import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

// Client-side Supabase client (for use in Client Components)
export function createClient() {
  return createClientComponentClient()
}

// Server-side Supabase client (for use in Server Components)
export async function createServerClient() {
  const cookieStore = await cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}
