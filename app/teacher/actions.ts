"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const legacyGradeMap: Record<string, string[]> = {
  "1 Merbau": ["1A", "1"],
  "1 Jati": ["1B"],
  "2 Merbau": ["2A", "2"],
  "2 Jati": ["2B"],
  "3 Merbau": ["3A", "3"],
  "3 Jati": ["3B"],
  "4 Merbau": ["4A", "4"],
  "4 Jati": ["4B"],
  "5 Merbau": ["5A", "5"],
  "5 Jati": ["5B"],
  "6 Merbau": ["6A", "6"],
  "6 Jati": ["6B"],
};

function getAllSearchGrades(assignedClasses: string[]) {
  const grades = new Set(assignedClasses);
  assignedClasses.forEach((c) => {
    const legacy = legacyGradeMap[c];
    if (legacy) legacy.forEach((l) => grades.add(l));
  });
  return Array.from(grades);
}

export interface TeacherPayment {
  id: string;
  studentName: string;
  className: string;
  amount: number;
  dateOfPayment: string;
  status: "Approved" | "Pending" | "Rejected" | "Unpaid";
  paymentProof?: string;
  amountDue?: number;
}

export interface TeacherDashboardStats {
  totalPaymentsReceived: number;
  totalOutstandingPayments: number;
  studentsPaidCount: number;
  totalStudents: number;
  totalToReceive: number;
  partialPaymentsCount: number;
  fullPaymentsCount: number;
  percentagePaidInFull: number;
}

export async function getTeacherPayments() {
  try {
    const supabase = createServerActionClient({ cookies });

    // Get current teacher's profile and assigned classes
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return {
        payments: [],
        assignedClasses: [],
        classTotals: [],
        stats: {
          totalPaymentsReceived: 0,
          totalOutstandingPayments: 0,
          studentsPaidCount: 0,
          totalStudents: 0,
          totalToReceive: 0,
          partialPaymentsCount: 0,
          fullPaymentsCount: 0,
          percentagePaidInFull: 0,
        },
      };
    }

    console.log("Teacher user ID:", user.id);

    // Verify user is a teacher
    const { data: teacherProfile } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", user.id)
      .eq("role", "teacher")
      .single();

    if (!teacherProfile) {
      return {
        payments: [],
        assignedClasses: [],
        classTotals: [],
        stats: {
          totalPaymentsReceived: 0,
          totalOutstandingPayments: 0,
          studentsPaidCount: 0,
          totalStudents: 0,
          totalToReceive: 0,
          partialPaymentsCount: 0,
          fullPaymentsCount: 0,
          percentagePaidInFull: 0,
        },
      };
    }

    console.log("Teacher profile:", teacherProfile);

    // Get teacher details with assigned classes
    const { data: teacherDetails } = await supabase
      .from("teacher_details")
      .select("assigned_classes")
      .eq("user_id", user.id)
      .single();

    console.log("Teacher details:", teacherDetails);

    if (!teacherDetails) {
      return {
        payments: [],
        assignedClasses: [],
        classTotals: [],
        stats: {
          totalPaymentsReceived: 0,
          totalOutstandingPayments: 0,
          studentsPaidCount: 0,
          totalStudents: 0,
          totalToReceive: 0,
          partialPaymentsCount: 0,
          fullPaymentsCount: 0,
          percentagePaidInFull: 0,
        },
      };
    }

    if (!teacherDetails?.assigned_classes) {
      return {
        payments: [],
        assignedClasses: [],
        classTotals: [],
        stats: {
          totalPaymentsReceived: 0,
          totalOutstandingPayments: 0,
          studentsPaidCount: 0,
          totalStudents: 0,
        },
      };
    }

    console.log("Teacher assigned classes:", teacherDetails.assigned_classes);

    const searchGrades = getAllSearchGrades(teacherDetails.assigned_classes);
    console.log("Search grades (including legacy):", searchGrades);

    // Get fee assignments for amount due calculation
    // Removed year restriction to match treasurer dashboard logic
    const { data: feeRows } = await supabase
      .from("fees_assignments")
      .select(
        "student_id, amount_due, grade, parent_students!fees_assignments_student_id_fkey(student_name)"
      )
      .in("grade", searchGrades)
      .eq("status", "Active");

    const feeMap = new Map<string, number>();
    const feeMapById = new Map<string, number>();

    (feeRows || []).forEach((r: any) => {
      if (r.student_id) {
        const current = feeMapById.get(r.student_id) || 0;
        feeMapById.set(r.student_id, current + (Number(r.amount_due) || 0));
      }

      const name = r.parent_students?.student_name;
      if (name) {
        const normalizedName = name.toLowerCase().trim();
        const normalizedGrade = r.grade;

        // Key 1: Full Name + Full Grade
        const k1 = `${normalizedName}|${normalizedGrade}`;
        feeMap.set(k1, (feeMap.get(k1) || 0) + (Number(r.amount_due) || 0));

        // Key 2: Full Name + Short Grade (e.g., "1")
        const gradeParts = normalizedGrade.split(" ");
        if (gradeParts.length > 0) {
          const shortGrade = gradeParts[0];
          const k2 = `${normalizedName}|${shortGrade}`;
          feeMap.set(k2, (feeMap.get(k2) || 0) + (Number(r.amount_due) || 0));
        }

        // Key 3: Full Name + "Grade X Merbau"
        const gradeWithPrefix = `grade ${normalizedGrade.toLowerCase()}`;
        const k3 = `${normalizedName}|${gradeWithPrefix}`;
        feeMap.set(k3, (feeMap.get(k3) || 0) + (Number(r.amount_due) || 0));

        // Key 4: Name Only
        const k4 = `NAME_ONLY:${normalizedName}`;
        feeMap.set(k4, (feeMap.get(k4) || 0) + (Number(r.amount_due) || 0));
      }
    });

    // Get all students in teacher's assigned classes
    const { data: students } = await supabase
      .from("parent_students")
      .select("id, student_name, student_grade")
      .in("student_grade", teacherDetails.assigned_classes);

    console.log("Students found:", students);

    if (!students || students.length === 0) {
      console.log("No students found in assigned classes");
    }

    // Get payments for these students from all payment tables
    const studentNames = students.map((s) => s.student_name);
    const studentGrades = students.map((s) => s.student_grade);

    console.log("Student names:", studentNames);
    console.log("Student grades:", studentGrades);

    // Get submitted payments (submitted by teacher)
    const { data: submittedPayments } = await supabase
      .from("submitpayment")
      .select(
        "id, parent_id, student_name, grade, amount, created_at, status, proof_url"
      )
      .in("student_name", studentNames)
      .in("grade", searchGrades);

    console.log("Submitted payments found:", submittedPayments);

    // Get approved payments
    const { data: approvedPayments } = await supabase
      .from("approved_payments")
      .select(
        "submitpayment_id, student_name, grade, amount, approved_at, proof_url"
      )
      .in("student_name", studentNames)
      .in("grade", searchGrades);

    console.log("Approved payments found:", approvedPayments);

    // Get rejected payments
    const { data: rejectedPayments } = await supabase
      .from("rejected_payments")
      .select(
        "submitpayment_id, student_name, grade, amount, rejected_at, proof_url"
      )
      .in("student_name", studentNames)
      .in("grade", searchGrades);

    console.log("Rejected payments found:", rejectedPayments);

    // Combine all payments into unified format
    const payments: TeacherPayment[] = [];

    const studentNameIdMap = new Map<string, string>();
    students.forEach((s) => studentNameIdMap.set(s.student_name, s.id));

    // Helper to find due amount using robust matching
    const getDueAmount = (
      studentName: string,
      grade: string,
      studentId?: string
    ) => {
      if (studentId) {
        const due = feeMapById.get(studentId);
        if (due !== undefined) return due;
      }

      const normalizedName = studentName.toLowerCase().trim();
      const normalizedKey = `${normalizedName}|${grade}`;

      // Try 1: Exact match
      let due = feeMap.get(normalizedKey) || 0;

      // Try 2: Lowercase match
      if (!due) due = feeMap.get(normalizedKey.toLowerCase());

      // Try 3: Strip "Grade " prefix
      if (!due && grade.toLowerCase().startsWith("grade ")) {
        const strippedGrade = grade.toLowerCase().replace("grade ", "").trim();
        const keyStripped = `${normalizedName}|${strippedGrade}`;
        due = feeMap.get(keyStripped) || 0;
      }

      // Try 4: Name Only
      if (!due) due = feeMap.get(`NAME_ONLY:${normalizedName}`) || 0;

      return due;
    };

    // Process submitted payments
    submittedPayments?.forEach((payment) => {
      const sId = studentNameIdMap.get(payment.student_name);
      payments.push({
        id: payment.id,
        studentName: payment.student_name,
        className: payment.grade,
        amount: Number(payment.amount) || 0,
        dateOfPayment: payment.created_at
          ? new Date(payment.created_at).toISOString().split("T")[0]
          : "",
        status:
          payment.status === "Approved"
            ? "Approved"
            : payment.status === "Rejected"
            ? "Rejected"
            : "Pending",
        paymentProof: payment.proof_url || undefined,
        amountDue: getDueAmount(payment.student_name, payment.grade, sId),
      });
    });

    console.log(
      "Processed submitted payments count:",
      submittedPayments?.length || 0
    );

    // Process approved payments
    approvedPayments?.forEach((payment) => {
      const sId = studentNameIdMap.get(payment.student_name);
      payments.push({
        id: payment.submitpayment_id,
        studentName: payment.student_name,
        className: payment.grade,
        amount: Number(payment.amount) || 0,
        dateOfPayment: payment.approved_at
          ? new Date(payment.approved_at).toISOString().split("T")[0]
          : "",
        status: "Approved",
        paymentProof: payment.proof_url || undefined,
        amountDue: getDueAmount(payment.student_name, payment.grade, sId),
      });
    });

    console.log(
      "Processed approved payments count:",
      approvedPayments?.length || 0
    );

    // Process rejected payments
    rejectedPayments?.forEach((payment) => {
      const sId = studentNameIdMap.get(payment.student_name);
      payments.push({
        id: payment.submitpayment_id,
        studentName: payment.student_name,
        className: payment.grade,
        amount: Number(payment.amount) || 0,
        dateOfPayment: payment.rejected_at
          ? new Date(payment.rejected_at).toISOString().split("T")[0]
          : "",
        status: "Rejected",
        paymentProof: payment.proof_url || undefined,
        amountDue: getDueAmount(payment.student_name, payment.grade, sId),
      });
    });

    console.log(
      "Processed rejected payments count:",
      rejectedPayments?.length || 0
    );

    // Add students with no payments
    const paymentStudentKeys = new Set(
      payments.map((p) => `${p.studentName}|${p.className}`)
    );

    students.forEach((student) => {
      const key = `${student.student_name}|${student.student_grade}`;
      if (!paymentStudentKeys.has(key)) {
        payments.push({
          id: `unpaid-${student.id}`,
          studentName: student.student_name,
          className: student.student_grade,
          amount: 0,
          dateOfPayment: "",
          status: "Unpaid",
          paymentProof: undefined,
          amountDue: getDueAmount(
            student.student_name,
            student.student_grade,
            student.id
          ),
        });
      }
    });

    console.log("Total combined payments:", payments.length);

    // Calculate statistics
    const confirmedPayments = payments.filter((p) => p.status === "Approved");
    const pendingPayments = payments.filter((p) => p.status === "Pending");
    const totalPaymentsReceived = confirmedPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    const totalOutstandingPayments = pendingPayments.reduce(
      (sum, p) => sum + p.amount,
      0
    );
    let studentsPaidCount = new Set(
      confirmedPayments.map((p) => `${p.studentName}|${p.className}`)
    ).size;
    let totalStudents = students.length;
    let partialPaymentsCount = pendingPayments.length;
    let fullPaymentsCount = 0;
    try {
      // Calculate stats by iterating unique students using confirmedPayments (which includes all approved payments)
      fullPaymentsCount = 0;
      partialPaymentsCount = 0;
      studentsPaidCount = 0;

      students.forEach((student) => {
        const due = feeMapById.get(student.id) || 0;
        const normalizedName = student.student_name.toLowerCase().trim();
        const normalizedGrade = student.student_grade; // e.g., "2 Merbau"

        const paid = confirmedPayments.reduce((sum, p) => {
          const rowName = p.studentName.toLowerCase().trim();
          const rowGrade = p.className;
          let isMatch = false;

          if (rowName === normalizedName) {
            // Check grade match (Exact, Short, Prefix, or Legacy map)
            if (rowGrade === normalizedGrade) isMatch = true;
            else if (
              normalizedGrade.includes(rowGrade) ||
              rowGrade.includes(normalizedGrade)
            )
              isMatch = true;
            else {
              // Check legacy
              const legacy = legacyGradeMap[normalizedGrade];
              if (legacy && legacy.includes(rowGrade)) isMatch = true;

              // Check short grade "2" vs "2 Merbau"
              if (
                rowGrade.split(" ")[0] === normalizedGrade.split(" ")[0] ||
                rowGrade.toLowerCase().replace("grade ", "").trim() ===
                  normalizedGrade.toLowerCase()
              )
                isMatch = true;
            }
          }
          return isMatch ? sum + p.amount : sum;
        }, 0);

        if (paid > 0) {
          studentsPaidCount++;
          if (due > 0) {
            // Allow small float error or overpayment
            if (paid >= due - 0.01) fullPaymentsCount++;
            else partialPaymentsCount++;
          }
        }
      });
    } catch {}

    if (students.length === 0) {
      try {
        const currentYear = new Date().getFullYear();
        const { data: faCounts } = await supabase
          .from("fees_assignments")
          .select("student_id, grade, year")
          .in("grade", searchGrades)
          .eq("year", currentYear);
        totalStudents = faCounts ? faCounts.length : 0;

        const { data: approvedInClasses } = await supabase
          .from("approved_payments")
          .select("student_name, grade, approved_at")
          .in("grade", searchGrades)
          .gte("approved_at", `${currentYear}-01-01`)
          .lt("approved_at", `${currentYear + 1}-01-01`);
        studentsPaidCount = approvedInClasses
          ? new Set(
              approvedInClasses.map((r: any) => `${r.student_name}|${r.grade}`)
            ).size
          : 0;
      } catch {}
    }

    let stats: TeacherDashboardStats = {
      totalPaymentsReceived,
      totalOutstandingPayments,
      studentsPaidCount,
      totalStudents,
      totalToReceive: totalOutstandingPayments + totalPaymentsReceived,
      partialPaymentsCount,
      fullPaymentsCount,
      percentagePaidInFull:
        totalStudents > 0 ? (fullPaymentsCount / totalStudents) * 100 : 0,
    };

    console.log("Final stats:", stats);
    console.log("Final payments count:", payments.length);

    let classTotals: any[] = [];
    try {
      const currentYear = new Date().getFullYear();
      const { data: ct, error } = await supabase
        .from("v_totals_by_class")
        .select("grade, year, to_receive, received, outstanding")
        .in("grade", searchGrades)
        .eq("year", currentYear);

      if (!error && ct) {
        classTotals = ct;
      }

      if (!error && classTotals && classTotals.length > 0) {
        const totalReceivedFromView = classTotals.reduce(
          (sum: number, r: any) => sum + Number(r.received || 0),
          0
        );
        const totalOutstandingFromView = classTotals.reduce(
          (sum: number, r: any) => sum + Number(r.outstanding || 0),
          0
        );
        const totalToReceiveFromView = classTotals.reduce(
          (sum: number, r: any) => sum + Number(r.to_receive || 0),
          0
        );
        stats = {
          ...stats,
          totalPaymentsReceived: totalReceivedFromView,
          totalOutstandingPayments: totalOutstandingFromView,
          totalToReceive: totalToReceiveFromView,
        };
      } else {
        const { data: toReceiveRowsYear } = await supabase
          .from("fees_assignments")
          .select("student_id, amount_due")
          .in("grade", searchGrades)
          .eq("year", currentYear)
          .eq("status", "Active");
        const toReceiveSumYear = (toReceiveRowsYear || []).reduce(
          (sum: number, r: any) => sum + Number(r.amount_due || 0),
          0
        );

        const { data: receivedByApprovedAt } = await supabase
          .from("approved_payments")
          .select("student_name, grade, amount, approved_at")
          .in("grade", searchGrades)
          .gte("approved_at", `${currentYear}-01-01`)
          .lt("approved_at", `${currentYear + 1}-01-01`);

        const { data: receivedByCreatedAt } = await supabase
          .from("approved_payments")
          .select("student_name, grade, amount, created_at")
          .in("grade", searchGrades)
          .is("approved_at", null)
          .gte("created_at", `${currentYear}-01-01`)
          .lt("created_at", `${currentYear + 1}-01-01`);

        const receivedYearRows = [
          ...(receivedByApprovedAt || []),
          ...(receivedByCreatedAt || []),
        ];
        const receivedSumYear = receivedYearRows.reduce(
          (sum: number, r: any) => sum + Number(r.amount || 0),
          0
        );

        let toReceiveRowsAll: any[] = [];
        let toReceiveSumAll = 0;
        if (toReceiveSumYear === 0) {
          const { data: toReceiveAll } = await supabase
            .from("fees_assignments")
            .select("student_id, amount_due")
            .in("grade", searchGrades)
            .eq("status", "Active");
          toReceiveRowsAll = toReceiveAll || [];
          toReceiveSumAll = toReceiveRowsAll.reduce(
            (sum: number, r: any) => sum + Number(r.amount_due || 0),
            0
          );
        }

        let receivedAllRows: any[] = [];
        let receivedSumAll = 0;
        if (receivedSumYear === 0) {
          const { data: receivedAll } = await supabase
            .from("approved_payments")
            .select("student_name, grade, amount")
            .in("grade", searchGrades);
          receivedAllRows = receivedAll || [];
          receivedSumAll = receivedAllRows.reduce(
            (sum: number, r: any) => sum + Number(r.amount || 0),
            0
          );
        }

        const finalToReceive =
          toReceiveSumYear > 0 ? toReceiveSumYear : toReceiveSumAll;
        const finalReceived =
          receivedSumYear > 0 ? receivedSumYear : receivedSumAll;

        stats = {
          ...stats,
          totalPaymentsReceived: finalReceived,
          totalOutstandingPayments: Math.max(finalToReceive - finalReceived, 0),
          totalToReceive: finalToReceive,
        };

        if (students.length === 0) {
          const distinctStudentsYear = new Set<string>();
          (toReceiveRowsYear || []).forEach((r: any) =>
            distinctStudentsYear.add(r.student_id)
          );
          let totalStudentsCount = distinctStudentsYear.size;
          if (totalStudentsCount === 0) {
            const distinctStudentsAll = new Set<string>();
            toReceiveRowsAll.forEach((r: any) =>
              distinctStudentsAll.add(r.student_id)
            );
            totalStudentsCount = distinctStudentsAll.size;
          }

          const distinctPaidYear = new Set<string>();
          receivedYearRows.forEach((r: any) =>
            distinctPaidYear.add(`${r.student_name}|${r.grade}`)
          );
          let paidCount = distinctPaidYear.size;
          if (paidCount === 0) {
            const distinctPaidAll = new Set<string>();
            receivedAllRows.forEach((r: any) =>
              distinctPaidAll.add(`${r.student_name}|${r.grade}`)
            );
            paidCount = distinctPaidAll.size;
          }

          stats = {
            ...stats,
            studentsPaidCount: paidCount,
            totalStudents: totalStudentsCount,
            percentagePaidInFull:
              totalStudentsCount > 0
                ? (paidCount / totalStudentsCount) * 100
                : 0,
          };
        }
      }
    } catch {}

    return {
      assignedClasses: teacherDetails.assigned_classes || [],
      classTotals: classTotals || [],
      payments: payments.sort(
        (a, b) =>
          new Date(b.dateOfPayment).getTime() -
          new Date(a.dateOfPayment).getTime()
      ),
      stats,
    };
  } catch (error) {
    console.error("Error fetching teacher payments:", error);
    throw error;
  }
}

export async function getTeacherPaymentById(paymentId: string) {
  try {
    const supabase = createServerActionClient({ cookies });

    // Get current teacher's profile and assigned classes
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    // Get teacher details with assigned classes
    const { data: teacherDetails } = await supabase
      .from("teacher_details")
      .select("assigned_classes")
      .eq("user_id", user.id)
      .single();

    if (!teacherDetails?.assigned_classes) {
      return null;
    }

    // Try to find payment in all tables
    let payment: TeacherPayment | null = null;

    // Check submitpayment table
    const { data: submittedPayment } = await supabase
      .from("submitpayment")
      .select("id, student_name, grade, amount, created_at, status, proof_url")
      .eq("id", paymentId)
      .single();

    if (submittedPayment) {
      payment = {
        id: submittedPayment.id,
        studentName: submittedPayment.student_name,
        className: submittedPayment.grade,
        amount: Number(submittedPayment.amount) || 0,
        dateOfPayment: submittedPayment.created_at
          ? new Date(submittedPayment.created_at).toISOString().split("T")[0]
          : "",
        status:
          submittedPayment.status === "Approved"
            ? "Approved"
            : submittedPayment.status === "Rejected"
            ? "Rejected"
            : "Pending",
        paymentProof: submittedPayment.proof_url || undefined,
      };
    }

    // Check approved_payments table
    if (!payment) {
      const { data: approvedPayment } = await supabase
        .from("approved_payments")
        .select(
          "submitpayment_id, student_name, grade, amount, approved_at, proof_url"
        )
        .eq("submitpayment_id", paymentId)
        .single();

      if (approvedPayment) {
        payment = {
          id: approvedPayment.submitpayment_id,
          studentName: approvedPayment.student_name,
          className: approvedPayment.grade,
          amount: Number(approvedPayment.amount) || 0,
          dateOfPayment: approvedPayment.approved_at
            ? new Date(approvedPayment.approved_at).toISOString().split("T")[0]
            : "",
          status: "Approved",
          paymentProof: approvedPayment.proof_url || undefined,
        };
      }
    }

    // Check rejected_payments table
    if (!payment) {
      const { data: rejectedPayment } = await supabase
        .from("rejected_payments")
        .select(
          "submitpayment_id, student_name, grade, amount, rejected_at, proof_url"
        )
        .eq("submitpayment_id", paymentId)
        .single();

      if (rejectedPayment) {
        payment = {
          id: rejectedPayment.submitpayment_id,
          studentName: rejectedPayment.student_name,
          className: rejectedPayment.grade,
          amount: Number(rejectedPayment.amount) || 0,
          dateOfPayment: rejectedPayment.rejected_at
            ? new Date(rejectedPayment.rejected_at).toISOString().split("T")[0]
            : "",
          status: "Rejected",
          paymentProof: rejectedPayment.proof_url || undefined,
        };
      }
    }

    // Verify the payment belongs to teacher's assigned classes
    if (
      payment &&
      !teacherDetails.assigned_classes.includes(payment.className)
    ) {
      return null;
    }

    return payment;
  } catch (error) {
    console.error("Error fetching teacher payment by ID:", error);
    throw error;
  }
}
