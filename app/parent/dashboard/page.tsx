"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { MainHeader } from "../../../components/MainHeader";
import { format } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  created_at: string;
  proof_url: string | null;
  status: string; // Pending | Approved | Rejected
}

interface StudentData {
  student_name: string;
  grade: string;
  payments: Payment[];
  totalPaid: number;
  remaining: number;
}

export default function ParentDashboard() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 🟢 Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    fetchUser();
  }, []);

  // Fetch data (Students + Payments)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // 1. Fetch Students (Robustly - matching Payment page logic)
        let studentRecords: any[] = [];

        // Option A: Direct parent_id match
        const { data: dataA, error: errorA } = await supabase
          .from("parent_students")
          .select("*")
          .eq("parent_id", user.id);

        if (!errorA && dataA && dataA.length > 0) {
          studentRecords = dataA;
        } else {
          // Option B: Fallback via Profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", user.email)
            .maybeSingle();

          if (profile) {
            const { data: dataB } = await supabase
              .from("parent_students")
              .select("*")
              .eq("parent_id", profile.id);
            if (dataB) studentRecords = dataB;
          }
        }

        // 2. Fetch Payments
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          supabase.from("submitpayment").select("*").eq("parent_id", user.id),
          supabase
            .from("approved_payments")
            .select("*")
            .eq("parent_id", user.id),
          supabase
            .from("rejected_payments")
            .select("*")
            .eq("parent_id", user.id),
        ]);

        if (pendingRes.error) throw pendingRes.error;
        if (approvedRes.error) throw approvedRes.error;
        if (rejectedRes.error) throw rejectedRes.error;

        const allPayments = [
          ...(pendingRes.data || []).map((p) => ({ ...p, status: "Pending" })),
          ...(approvedRes.data || []).map((p) => ({
            ...p,
            status: "Approved",
          })),
          ...(rejectedRes.data || []).map((p) => ({
            ...p,
            status: "Rejected",
          })),
        ];

        // 3. Map Payments to Students
        const mappedStudents: StudentData[] = studentRecords.map((student) => {
          const studentPayments = allPayments.filter(
            (p) => p.student_name === student.student_name
          );

          const totalPaid = studentPayments
            .filter((p) => p.status === "Approved")
            .reduce((sum, p) => sum + Number(p.amount), 0);

          const payments: Payment[] = studentPayments.map((p) => ({
            id: p.id,
            amount: p.amount,
            created_at: p.created_at,
            proof_url: p.proof_url,
            status: p.status,
          }));

          return {
            student_name: student.student_name,
            grade: student.student_grade, // Use authoritative grade
            payments: payments,
            totalPaid,
            remaining: 0, // Will be calculated below
          };
        });

        // 4️ Apply sibling rule — first = 90, others = 50, with January yearly increment and carry-over logic
        const allStudents = mappedStudents;
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // 0 = January
        const isAfterJanuary = currentMonth >= 0; // always true, but we’ll use month check for yearly logic

        // Determine how many years have passed since start (e.g., 2025 baseline)
        const BASE_YEAR = 2025;
        const yearDiff = currentYear - BASE_YEAR;

        // Base tuition per sibling position
        allStudents.forEach((student, index) => {
          //  Base amount for this student
          let baseFee = index === 0 ? 90 : 50;

          //  Yearly increment (every January increases the fee)
          let yearlyFee = baseFee + yearDiff * baseFee; // e.g., 2026 → +90 or +50

          // Skip if grade > 6
          if (parseInt(student.grade) > 6) yearlyFee = 0;

          //  Calculate total paid so far
          const totalPaid = student.totalPaid;
          let remaining = yearlyFee - totalPaid;

          //  Handle carry-over after January
          // If unpaid balance remains from previous year → add it to this year's fee
          if (remaining > 0 && currentMonth === 0) {
            remaining = yearlyFee + remaining; // add unpaid
          }

          // 🔹 If overpaid → subtract extra
          if (remaining < 0 && currentMonth === 0) {
            remaining = yearlyFee + remaining; // subtract overpayment
          }

          student.remaining = Math.max(remaining, 0);
        });

        setStudents(allStudents);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <MainHeader userType="parent" activePath="/parent/dashboard" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-blue-500 rounded-full mb-4"></div>
            <p className="text-slate-500 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MainHeader userType="parent" activePath="/parent/dashboard" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            My Children
          </h1>
          <p className="text-slate-500 mt-2">
            View tuition fees and payment history for your children.
          </p>
        </div>

        <div className="space-y-8">
          {students.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
              <div className="mx-auto h-12 w-12 text-slate-300 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-900">
                No students found
              </h3>
              <p className="mt-1 text-slate-500">
                No student records are associated with your account.
              </p>
            </div>
          ) : (
            students.map((student, index) => (
              <Card
                key={index}
                className="bg-white shadow-sm border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                {/* Student Header */}
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                        {student.student_name.charAt(0)}
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                          {student.student_name}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Grade {student.grade}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fees Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 bg-slate-50/50">
                  <div className="p-6 flex flex-col items-center sm:items-start">
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Remaining Tuition Fees
                    </p>
                    <p
                      className={`text-2xl sm:text-3xl font-bold ${
                        student.remaining > 0
                          ? "text-red-600"
                          : "text-slate-900"
                      }`}
                    >
                      MYR {student.remaining.toFixed(2)}
                    </p>
                    {student.remaining > 0 && (
                      <span className="text-xs text-red-500 mt-1 font-medium">
                        Payment Due
                      </span>
                    )}
                  </div>
                  <div className="p-6 flex flex-col items-center sm:items-start">
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Total Paid So Far
                    </p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">
                      MYR {student.totalPaid.toFixed(2)}
                    </p>
                    <span className="text-xs text-green-500 mt-1 font-medium">
                      Verified Payments
                    </span>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    Transaction History
                  </h3>

                  <div className="overflow-hidden rounded-xl border border-slate-200">
                    <div className="overflow-x-auto">
                      {student.payments.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50">
                          <p className="text-slate-500 text-sm">
                            No transaction history available.
                          </p>
                        </div>
                      ) : (
                        <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-slate-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                              >
                                Date
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                              >
                                Description
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
                              >
                                Amount
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
                              >
                                Status
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
                              >
                                Receipt
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-slate-200">
                            {student.payments
                              .sort(
                                (a, b) =>
                                  new Date(b.created_at).getTime() -
                                  new Date(a.created_at).getTime()
                              )
                              .map((p) => (
                                <tr
                                  key={p.id}
                                  className="hover:bg-slate-50 transition-colors"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                                    {format(
                                      new Date(p.created_at),
                                      "MMM dd, yyyy"
                                    )}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                    Tuition Payment
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                    MYR {p.amount.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                        p.status === "Approved"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : p.status === "Rejected"
                                          ? "bg-red-50 text-red-700 border-red-200"
                                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      }`}
                                    >
                                      {p.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    {p.status === "Approved" ? (
                                      <a
                                        href={`/receipts/${p.id}`}
                                        className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 transition-colors"
                                      >
                                        Download
                                      </a>
                                    ) : (
                                      <span className="text-slate-300">—</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
