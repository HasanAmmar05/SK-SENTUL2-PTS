"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { cookies } from "next/headers";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";

import { generateTemporaryPassword } from "@/lib/auth-utils";

interface AddStaffData {
  fullName: string;
  email: string;
  phone: string;
  role: "teacher" | "treasurer";
  assignedClasses?: string[];
}

export async function addStaffMember(data: AddStaffData) {
  try {
    const supabase = createServerActionClient({ cookies });
    const cookieNames = cookies()
      .getAll()
      .map((c) => c.name);
    const envOk =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    console.log("addStaffMember:start", {
      email: data.email,
      role: data.role,
      cookieNames,
      envOk,
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("addStaffMember:getUser", { hasUser: !!user });

    if (!user) {
      return { error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    console.log("addStaffMember:adminProfile", { role: profile?.role });

    if (!profile || profile.role !== "admin") {
      return { error: "Unauthorized: Admin access required" };
    }

    // Validate teacher classes
    if (
      data.role === "teacher" &&
      (!data.assignedClasses || data.assignedClasses.length === 0)
    ) {
      return { error: "Teachers must have at least one assigned class" };
    }
    // Check for existing email
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("email")
      .eq("email", data.email)
      .single();
    console.log("addStaffMember:duplicateCheck", { exists: !!existingProfile });

    if (existingProfile) {
      return { error: "This email is already registered" };
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();

    // Use admin client to create user
    const adminClient = createAdminClient();

    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: data.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: data.fullName,
        },
      });
    console.log("addStaffMember:createAuth", {
      userId: authData?.user?.id,
      hasError: !!authError,
    });

    if (authError) {
      console.error("Auth error:", authError);
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Failed to create user account" };
    }

    // Create profile
    const generatedIc = authData.user.id.replace(/-/g, "").slice(0, 12);
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      ic_number: generatedIc,
      email: data.email,
      full_name: data.fullName,
      phone: data.phone || null,
      role: data.role,
      is_active: true,
    });
    console.log("addStaffMember:insertProfile", { hasError: !!profileError, ic_number: generatedIc });

    if (profileError) {
      console.error("Profile error:", profileError);
      return { error: "Failed to create profile: " + profileError.message };
    }

    // Create role-specific details
    if (data.role === "teacher") {
      const { error: teacherError } = await supabase
        .from("teacher_details")
        .insert({
          user_id: authData.user.id,
          assigned_classes: data.assignedClasses || [],
        });
      console.log("addStaffMember:insertTeacherDetails", {
        hasError: !!teacherError,
      });

      if (teacherError) {
        console.error("Teacher details error:", teacherError);
        return {
          error: "Failed to create teacher details: " + teacherError.message,
        };
      }
    } else if (data.role === "treasurer") {
      const { error: treasurerError } = await supabase
        .from("treasurer_details")
        .insert({
          user_id: authData.user.id,
          access_level: "full",
        });
      console.log("addStaffMember:insertTreasurerDetails", {
        hasError: !!treasurerError,
      });

      if (treasurerError) {
        console.error("Treasurer details error:", treasurerError);
        return {
          error:
            "Failed to create treasurer details: " + treasurerError.message,
        };
      }
    }

    return {
      success: true,
      tempPassword,
      message: "Staff member added successfully",
    };
  } catch (error) {
    console.error("addStaffMember:unexpected", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function updateStaffMember(
  staffId: string,
  updates: Partial<AddStaffData>
) {
  try {
    const supabase = createServerActionClient({ cookies });
    const cookieNames = cookies()
      .getAll()
      .map((c) => c.name);
    console.log("updateStaffMember:start", { staffId, cookieNames });

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("updateStaffMember:getUser", { hasUser: !!user });

    if (!user) {
      return { error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    console.log("updateStaffMember:adminProfile", { role: profile?.role });

    if (!profile || profile.role !== "admin") {
      return { error: "Unauthorized: Admin access required" };
    }

    const updateData: any = {};

    if (updates.fullName) updateData.full_name = updates.fullName;
    if (updates.email) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", staffId);
    console.log("updateStaffMember:updateProfile", {
      hasError: !!profileError,
    });

    if (profileError) {
      return { error: "Failed to update profile: " + profileError.message };
    }

    // Update role-specific details
    const { data: staffProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", staffId)
      .single();
    console.log("updateStaffMember:staffProfile", { role: staffProfile?.role });

    if (staffProfile?.role === "teacher" && updates.assignedClasses) {
      const { error: teacherError } = await supabase
        .from("teacher_details")
        .update({
          assigned_classes: updates.assignedClasses,
        })
        .eq("user_id", staffId);
      console.log("updateStaffMember:updateTeacherDetails", {
        hasError: !!teacherError,
      });

      if (teacherError) {
        return {
          error: "Failed to update teacher details: " + teacherError.message,
        };
      }
    }

    return { success: true, message: "Staff member updated successfully" };
  } catch (error) {
    console.error("updateStaffMember:unexpected", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function toggleStaffStatus(
  staffId: string,
  currentStatus: boolean
) {
  try {
    const supabase = createServerActionClient({ cookies });
    const cookieNames = cookies()
      .getAll()
      .map((c) => c.name);
    console.log("toggleStaffStatus:start", {
      staffId,
      currentStatus,
      cookieNames,
    });

    // Verify admin access
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("toggleStaffStatus:getUser", { hasUser: !!user });

    if (!user) {
      return { error: "Not authenticated" };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    console.log("toggleStaffStatus:adminProfile", { role: profile?.role });

    if (!profile || profile.role !== "admin") {
      return { error: "Unauthorized: Admin access required" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentStatus })
      .eq("id", staffId);
    console.log("toggleStaffStatus:updateStatus", { hasError: !!error });

    if (error) {
      return { error: "Failed to update staff status: " + error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("toggleStaffStatus:unexpected", error);
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
