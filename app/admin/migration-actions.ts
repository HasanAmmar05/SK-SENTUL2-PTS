"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const classMapping: Record<string, string> = {
  "1A": "1 Merbau",
  "1B": "1 Jati",
  "2A": "2 Merbau",
  "2B": "2 Jati",
  "3A": "3 Merbau",
  "3B": "3 Jati",
  "4A": "4 Merbau",
  "4B": "4 Jati",
  "5A": "5 Merbau",
  "5B": "5 Jati",
  "6A": "6 Merbau",
  "6B": "6 Jati",
};

const gradeMapping: Record<string, string> = {
  "1": "1 Merbau",
  "2": "2 Merbau",
  "3": "3 Merbau",
  "4": "4 Merbau",
  "5": "5 Merbau",
  "6": "6 Merbau",
};

export async function migrateClasses() {
  const supabase = createServerActionClient({ cookies });
  const adminClient = createAdminClient();
  const logs: string[] = [];

  try {
    // 1. Verify Admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("Migration: No user found");
      return { success: false, error: "Not authenticated" };
    }

    // Use adminClient to fetch profile to bypass RLS issues
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    console.log("Migration: User ID:", user.id);
    console.log("Migration: Profile Role:", profile?.role);

    if (profile?.role !== "admin") {
      return {
        success: false,
        error: `Unauthorized: User role is '${profile?.role}'`,
      };
    }

    logs.push("Starting migration...");

    // 2. Migrate Teachers (Teacher Details + Profiles + Auth)
    const { data: teachers } = await supabase
      .from("teacher_details")
      .select("*");

    if (teachers) {
      for (const teacher of teachers) {
        let needsUpdate = false;
        const newClasses = (teacher.assigned_classes || []).map((c: string) => {
          if (classMapping[c]) {
            needsUpdate = true;
            return classMapping[c];
          }
          return c;
        });

        if (needsUpdate) {
          // Update teacher_details
          await supabase
            .from("teacher_details")
            .update({ assigned_classes: newClasses })
            .eq("user_id", teacher.user_id);
          logs.push(
            `Updated teacher details for ${teacher.user_id}: ${JSON.stringify(
              newClasses
            )}`
          );

          // Check if it's a Class Account (check profile email)
          const { data: teacherProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", teacher.user_id)
            .single();

          if (teacherProfile && teacherProfile.email.startsWith("class")) {
            // It's likely a class account like class1a@...
            // We construct the new email based on the FIRST assigned class (usually class accounts have 1 class)
            const primaryClass = newClasses[0]; // e.g., "1 Merbau"
            if (primaryClass) {
              const cleanClass = primaryClass.toLowerCase().replace(/\s+/g, "");
              const newEmail = `class${cleanClass}@sksentul2.com`;
              const newName = `Class ${primaryClass} Teacher`;

              if (newEmail !== teacherProfile.email) {
                // Update Profile
                await supabase
                  .from("profiles")
                  .update({
                    email: newEmail,
                    full_name: newName,
                  })
                  .eq("id", teacher.user_id);

                // Update Auth
                await adminClient.auth.admin.updateUserById(teacher.user_id, {
                  email: newEmail,
                  user_metadata: { full_name: newName },
                });

                logs.push(
                  `Updated Class Account ${teacher.user_id} to ${newEmail}`
                );
              }
            }
          }
        }
      }
    }

    // 3. Migrate Students (Parent Students)
    const { data: students } = await supabase
      .from("parent_students")
      .select("*");

    if (students) {
      for (const student of students) {
        const currentGrade = student.student_grade; // "1", "2" or "1A"?
        let newGrade = null;

        if (gradeMapping[currentGrade]) {
          newGrade = gradeMapping[currentGrade];
        } else if (classMapping[currentGrade]) {
          newGrade = classMapping[currentGrade];
        }

        if (newGrade && newGrade !== currentGrade) {
          await supabase
            .from("parent_students")
            .update({ student_grade: newGrade })
            .eq("id", student.id);
          logs.push(
            `Updated student ${student.student_name} from ${currentGrade} to ${newGrade}`
          );
        }
      }
    }

    // 4. Update Payments? (submitpayment, approved_payments, rejected_payments)
    // Payments have a 'grade' column. We should update them too to keep history consistent/searchable
    const tables = ["submitpayment", "approved_payments", "rejected_payments"];
    for (const table of tables) {
      const { data: payments } = await supabase.from(table).select("id, grade");
      if (payments) {
        for (const payment of payments) {
          let newGrade = null;
          if (gradeMapping[payment.grade])
            newGrade = gradeMapping[payment.grade];
          else if (classMapping[payment.grade])
            newGrade = classMapping[payment.grade];

          if (newGrade) {
            await supabase
              .from(table)
              .update({ grade: newGrade })
              .eq("id", payment.id);
          }
        }
        logs.push(`Updated grades in table ${table}`);
      }
    }

    logs.push("Migration completed successfully.");
    return { success: true, logs };
  } catch (error: any) {
    console.error("Migration error:", error);
    return { success: false, error: error.message, logs };
  }
}
