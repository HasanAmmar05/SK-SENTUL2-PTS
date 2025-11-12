import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ⚠️ Using Supabase Service Role key — only safe here on the server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    // 1️⃣ Find the user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return NextResponse.json({ error: "Email not found." }, { status: 404 });
    }

    // 2️⃣ Save reset info
    const { error: insertError } = await supabaseAdmin.from("resetpass").insert({
      email,
      new_password: newPassword,
    });
    if (insertError) throw insertError;

    // 3️⃣ Update password in Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });
    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reset API error:", err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
