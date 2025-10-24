"use server"

import { createAdminClient } from "@/lib/supabase-admin"
import { createServerClient } from "@/lib/supabase"
import { validateMalaysianIC, generateTemporaryPassword } from "@/lib/auth-utils"

interface AddStaffData {
  fullName: string
  icNumber: string
  email: string
  phone: string
  role: "teacher" | "treasurer"
  assignedClasses?: string[]
  employeeId: string
}

export async function addStaffMember(data: AddStaffData) {
  try {
    // Verify admin access
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return { error: "Unauthorized: Admin access required" }
    }

    // Validate IC number
    if (!validateMalaysianIC(data.icNumber)) {
      return { error: "Invalid IC number format" }
    }

    // Validate teacher classes
    if (data.role === "teacher" && (!data.assignedClasses || data.assignedClasses.length === 0)) {
      return { error: "Teachers must have at least one assigned class" }
    }

    const cleanIC = data.icNumber.replace(/[\s-]/g, "")

    // Check for existing IC or email
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("ic_number, email")
      .or(`ic_number.eq.${cleanIC},email.eq.${data.email}`)
      .single()

    if (existingProfile) {
      if (existingProfile.ic_number === cleanIC) {
        return { error: "This IC number is already registered" }
      }
      return { error: "This email is already registered" }
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword()

    // Use admin client to create user
    const adminClient = createAdminClient()

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: data.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        ic_number: cleanIC,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: "Failed to create user account" }
    }

    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      ic_number: cleanIC,
      email: data.email,
      full_name: data.fullName,
      phone: data.phone || null,
      role: data.role,
      is_active: true,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      return { error: "Failed to create profile: " + profileError.message }
    }

    // Create role-specific details
    if (data.role === "teacher") {
      const { error: teacherError } = await supabase.from("teacher_details").insert({
        user_id: authData.user.id,
        employee_id: data.employeeId || null,
        assigned_classes: data.assignedClasses || [],
      })

      if (teacherError) {
        console.error("Teacher details error:", teacherError)
        return { error: "Failed to create teacher details: " + teacherError.message }
      }
    } else if (data.role === "treasurer") {
      const { error: treasurerError } = await supabase.from("treasurer_details").insert({
        user_id: authData.user.id,
        employee_id: data.employeeId || null,
        access_level: "full",
      })

      if (treasurerError) {
        console.error("Treasurer details error:", treasurerError)
        return { error: "Failed to create treasurer details: " + treasurerError.message }
      }
    }

    return {
      success: true,
      tempPassword,
      message: "Staff member added successfully",
    }
  } catch (error) {
    console.error("Unexpected error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function updateStaffMember(staffId: string, updates: Partial<AddStaffData>) {
  try {
    const supabase = await createServerClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return { error: "Unauthorized: Admin access required" }
    }

    // Validate IC if provided
    if (updates.icNumber && !validateMalaysianIC(updates.icNumber)) {
      return { error: "Invalid IC number format" }
    }

    const updateData: any = {}

    if (updates.fullName) updateData.full_name = updates.fullName
    if (updates.email) updateData.email = updates.email
    if (updates.phone !== undefined) updateData.phone = updates.phone
    if (updates.icNumber) updateData.ic_number = updates.icNumber.replace(/[\s-]/g, "")

    // Update profile
    const { error: profileError } = await supabase.from("profiles").update(updateData).eq("id", staffId)

    if (profileError) {
      return { error: "Failed to update profile: " + profileError.message }
    }

    // Update role-specific details
    const { data: staffProfile } = await supabase.from("profiles").select("role").eq("id", staffId).single()

    if (staffProfile?.role === "teacher" && updates.assignedClasses) {
      const { error: teacherError } = await supabase
        .from("teacher_details")
        .update({
          assigned_classes: updates.assignedClasses,
          employee_id: updates.employeeId,
        })
        .eq("user_id", staffId)

      if (teacherError) {
        return { error: "Failed to update teacher details: " + teacherError.message }
      }
    }

    return { success: true, message: "Staff member updated successfully" }
  } catch (error) {
    console.error("Update error:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function toggleStaffStatus(staffId: string, currentStatus: boolean) {
  try {
    const supabase = await createServerClient()

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Not authenticated" }
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      return { error: "Unauthorized: Admin access required" }
    }

    const { error } = await supabase.from("profiles").update({ is_active: !currentStatus }).eq("id", staffId)

    if (error) {
      return { error: "Failed to update staff status: " + error.message }
    }

    return { success: true }
  } catch (error) {
    console.error("Toggle status error:", error)
    return { error: "An unexpected error occurred" }
  }
}
