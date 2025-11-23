"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export interface TeacherPayment {
  id: string;
  studentName: string;
  className: string;
  amount: number;
  dateOfPayment: string;
  status: "Confirmed" | "Pending" | "Rejected";
  paymentProof?: string;
}

export interface TeacherDashboardStats {
  totalPaymentsReceived: number;
  totalOutstandingPayments: number;
  studentsPaidCount: number;
  totalStudents: number;
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
        stats: {
          totalPaymentsReceived: 0,
          totalOutstandingPayments: 0,
          studentsPaidCount: 0,
          totalStudents: 0,
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
        stats: {
          totalPaymentsReceived: 0,
          totalOutstandingPayments: 0,
          studentsPaidCount: 0,
          totalStudents: 0,
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
        stats: {
          totalPaymentsReceived: 0,
          totalOutstandingPayments: 0,
          studentsPaidCount: 0,
          totalStudents: 0,
        },
      };
    }

    if (!teacherDetails?.assigned_classes) {
      return {
        payments: [],
        stats: {
          totalPaymentsReceived: 0,
          totalOutstandingPayments: 0,
          studentsPaidCount: 0,
          totalStudents: 0,
        },
      };
    }

    console.log("Teacher assigned classes:", teacherDetails.assigned_classes);

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
      .in("grade", studentGrades);

    console.log("Submitted payments found:", submittedPayments);

    // Get approved payments
    const { data: approvedPayments } = await supabase
      .from("approved_payments")
      .select(
        "submitpayment_id, student_name, grade, amount, approved_at, proof_url"
      )
      .in("student_name", studentNames)
      .in("grade", studentGrades);

    console.log("Approved payments found:", approvedPayments);

    // Get rejected payments
    const { data: rejectedPayments } = await supabase
      .from("rejected_payments")
      .select(
        "submitpayment_id, student_name, grade, amount, rejected_at, proof_url"
      )
      .in("student_name", studentNames)
      .in("grade", studentGrades);

    console.log("Rejected payments found:", rejectedPayments);

    // Combine all payments into unified format
    const payments: TeacherPayment[] = [];

    // Process submitted payments
    submittedPayments?.forEach((payment) => {
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
            ? "Confirmed"
            : payment.status === "Rejected"
            ? "Rejected"
            : "Pending",
        paymentProof: payment.proof_url || undefined,
      });
    });

    console.log("Processed submitted payments count:", submittedPayments?.length || 0);

    // Process approved payments
    approvedPayments?.forEach((payment) => {
      payments.push({
        id: payment.submitpayment_id,
        studentName: payment.student_name,
        className: payment.grade,
        amount: Number(payment.amount) || 0,
        dateOfPayment: payment.approved_at
          ? new Date(payment.approved_at).toISOString().split("T")[0]
          : "",
        status: "Confirmed",
        paymentProof: payment.proof_url || undefined,
      });
    });

    console.log("Processed approved payments count:", approvedPayments?.length || 0);

    // Process rejected payments
    rejectedPayments?.forEach((payment) => {
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
      });
    });

    console.log("Processed rejected payments count:", rejectedPayments?.length || 0);
    console.log("Total combined payments:", payments.length);

    // Calculate statistics
    const confirmedPayments = payments.filter((p) => p.status === "Confirmed");
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

    if (students.length === 0) {
      try {
        const currentYear = new Date().getFullYear();
        const { data: faCounts } = await supabase
          .from("fees_assignments")
          .select("student_id, grade, year")
          .in("grade", teacherDetails.assigned_classes)
          .eq("year", currentYear);
        totalStudents = faCounts ? faCounts.length : 0;

        const { data: approvedInClasses } = await supabase
          .from("approved_payments")
          .select("student_name, grade, approved_at")
          .in("grade", teacherDetails.assigned_classes)
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
    };

    console.log("Final stats:", stats);
    console.log("Final payments count:", payments.length);

    try {
      const currentYear = new Date().getFullYear();
      const { data: classTotals, error } = await supabase
        .from("v_totals_by_class")
        .select("grade, year, to_receive, received, outstanding")
        .in("grade", teacherDetails.assigned_classes)
        .eq("year", currentYear);
      if (!error && classTotals && classTotals.length > 0) {
        const totalReceivedFromView = classTotals.reduce(
          (sum: number, r: any) => sum + Number(r.received || 0),
          0
        );
        const totalOutstandingFromView = classTotals.reduce(
          (sum: number, r: any) => sum + Number(r.outstanding || 0),
          0
        );
        stats = {
          ...stats,
          totalPaymentsReceived: totalReceivedFromView,
          totalOutstandingPayments: totalOutstandingFromView,
        };
      } else {
        const { data: toReceiveRowsYear } = await supabase
          .from("fees_assignments")
          .select("student_id, amount_due")
          .in("grade", teacherDetails.assigned_classes)
          .eq("year", currentYear)
          .eq("status", "Active");
        const toReceiveSumYear = (toReceiveRowsYear || []).reduce(
          (sum: number, r: any) => sum + Number(r.amount_due || 0),
          0
        );

        const { data: receivedByApprovedAt } = await supabase
          .from("approved_payments")
          .select("student_name, grade, amount, approved_at")
          .in("grade", teacherDetails.assigned_classes)
          .gte("approved_at", `${currentYear}-01-01`)
          .lt("approved_at", `${currentYear + 1}-01-01`);

        const { data: receivedByCreatedAt } = await supabase
          .from("approved_payments")
          .select("student_name, grade, amount, created_at")
          .in("grade", teacherDetails.assigned_classes)
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
            .in("grade", teacherDetails.assigned_classes)
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
            .in("grade", teacherDetails.assigned_classes);
          receivedAllRows = receivedAll || [];
          receivedSumAll = receivedAllRows.reduce(
            (sum: number, r: any) => sum + Number(r.amount || 0),
            0
          );
        }

        const finalToReceive = toReceiveSumYear > 0 ? toReceiveSumYear : toReceiveSumAll;
        const finalReceived = receivedSumYear > 0 ? receivedSumYear : receivedSumAll;

        stats = {
          ...stats,
          totalPaymentsReceived: finalReceived,
          totalOutstandingPayments: Math.max(finalToReceive - finalReceived, 0),
        };

        if (students.length === 0) {
          const distinctStudentsYear = new Set<string>();
          (toReceiveRowsYear || []).forEach((r: any) => distinctStudentsYear.add(r.student_id));
          let totalStudentsCount = distinctStudentsYear.size;
          if (totalStudentsCount === 0) {
            const distinctStudentsAll = new Set<string>();
            toReceiveRowsAll.forEach((r: any) => distinctStudentsAll.add(r.student_id));
            totalStudentsCount = distinctStudentsAll.size;
          }

          const distinctPaidYear = new Set<string>();
          receivedYearRows.forEach((r: any) => distinctPaidYear.add(`${r.student_name}|${r.grade}`));
          let paidCount = distinctPaidYear.size;
          if (paidCount === 0) {
            const distinctPaidAll = new Set<string>();
            receivedAllRows.forEach((r: any) => distinctPaidAll.add(`${r.student_name}|${r.grade}`));
            paidCount = distinctPaidAll.size;
          }

          stats = {
            ...stats,
            studentsPaidCount: paidCount,
            totalStudents: totalStudentsCount,
          };
        }
      }
    } catch {}

    return {
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
    const supabase = createServerActionClient({ cookies })
    
    // Get current teacher's profile and assigned classes
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return null
    }

    // Get teacher details with assigned classes
    const { data: teacherDetails } = await supabase
      .from("teacher_details")
      .select("assigned_classes")
      .eq("user_id", user.id)
      .single()

    if (!teacherDetails?.assigned_classes) {
      return null
    }

    // Try to find payment in all tables
    let payment: TeacherPayment | null = null

    // Check submitpayment table
    const { data: submittedPayment } = await supabase
      .from("submitpayment")
      .select("id, student_name, grade, amount, created_at, status, proof_url")
      .eq("id", paymentId)
      .single()

    if (submittedPayment) {
      payment = {
        id: submittedPayment.id,
        studentName: submittedPayment.student_name,
        className: submittedPayment.grade,
        amount: Number(submittedPayment.amount) || 0,
        dateOfPayment: submittedPayment.created_at ? new Date(submittedPayment.created_at).toISOString().split('T')[0] : '',
        status: submittedPayment.status === 'Approved' ? 'Confirmed' : submittedPayment.status === 'Rejected' ? 'Rejected' : 'Pending',
        paymentProof: submittedPayment.proof_url || undefined
      }
    }

    // Check approved_payments table
    if (!payment) {
      const { data: approvedPayment } = await supabase
        .from("approved_payments")
        .select("submitpayment_id, student_name, grade, amount, approved_at, proof_url")
        .eq("submitpayment_id", paymentId)
        .single()

      if (approvedPayment) {
        payment = {
          id: approvedPayment.submitpayment_id,
          studentName: approvedPayment.student_name,
          className: approvedPayment.grade,
          amount: Number(approvedPayment.amount) || 0,
          dateOfPayment: approvedPayment.approved_at ? new Date(approvedPayment.approved_at).toISOString().split('T')[0] : '',
          status: 'Confirmed',
          paymentProof: approvedPayment.proof_url || undefined
        }
      }
    }

    // Check rejected_payments table
    if (!payment) {
      const { data: rejectedPayment } = await supabase
        .from("rejected_payments")
        .select("submitpayment_id, student_name, grade, amount, rejected_at, proof_url")
        .eq("submitpayment_id", paymentId)
        .single()

      if (rejectedPayment) {
        payment = {
          id: rejectedPayment.submitpayment_id,
          studentName: rejectedPayment.student_name,
          className: rejectedPayment.grade,
          amount: Number(rejectedPayment.amount) || 0,
          dateOfPayment: rejectedPayment.rejected_at ? new Date(rejectedPayment.rejected_at).toISOString().split('T')[0] : '',
          status: 'Rejected',
          paymentProof: rejectedPayment.proof_url || undefined
        }
      }
    }

    // Verify the payment belongs to teacher's assigned classes
    if (payment && !teacherDetails.assigned_classes.includes(payment.className)) {
      return null
    }

    return payment

  } catch (error) {
    console.error("Error fetching teacher payment by ID:", error)
    throw error
  }
}