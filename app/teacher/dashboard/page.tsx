"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import {
  getTeacherPayments,
  TeacherPayment,
  TeacherDashboardStats,
} from "@/app/teacher/actions";
import { Button } from "@/components/ui/button";
import AuthWrapper from "@/components/auth-wrapper";
import { Loader2 } from "lucide-react";

export default function TeacherDashboardPage() {
  return (
    <AuthWrapper>
      <TeacherDashboardContent />
    </AuthWrapper>
  );
}

function TeacherDashboardContent() {
  const [payments, setPayments] = useState<TeacherPayment[]>([]);
  const [rolledPayments, setRolledPayments] = useState<TeacherPayment[]>([]);
  const [stats, setStats] = useState<TeacherDashboardStats>({
    totalPaymentsReceived: 0,
    totalOutstandingPayments: 0,
    studentsPaidCount: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialDisplayLimit = 5;
  const [displayLimit, setDisplayLimit] = useState(initialDisplayLimit);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTeacherPayments();
      setPayments(result.payments);
      const map = new Map<string, TeacherPayment>();
      for (const p of result.payments) {
        const key = `${p.studentName}|${p.className}`;
        const existing = map.get(key);
        const precedence = (s: "Confirmed" | "Pending" | "Rejected") =>
          s === "Confirmed" ? 3 : s === "Pending" ? 2 : 1;
        if (!existing || precedence(p.status) > precedence(existing.status)) {
          map.set(key, p);
        }
      }
      setRolledPayments(Array.from(map.values()));
      setStats(result.stats);
    } catch (err) {
      console.error("Failed to fetch teacher data:", err);
      setError("Failed to load payment data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColors = (status: "Confirmed" | "Pending" | "Rejected") => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const renderStudentPaymentStatus = () => {
    if (rolledPayments.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
            No payment records found for your assigned classes.
          </td>
        </tr>
      );
    }

    const paymentsToDisplay = rolledPayments.slice(0, displayLimit);

    return paymentsToDisplay.map((student) => {
      return (
        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-teacher)]">
            {student.studentName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-teacher)]">
            {student.className}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-teacher)]">
            RM{student.amount.toFixed(2)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-teacher)]">
            {student.dateOfPayment}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColors(
                student.status
              )}`}
            >
              {student.status}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <Link href={`/teacher/payment-details/${student.id}`} passHref>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </td>
        </tr>
      );
    });
  };

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[var(--background-color-teacher)] group/design-root overflow-x-hidden">
        <div className="flex h-full grow flex-row">
          <TeacherSidebar />
          <main className="flex-1 bg-[var(--background-color-teacher)] p-8">
            <div className="max-w-5xl mx-auto flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--primary-color-teacher)]" />
                <span className="text-[var(--text-primary-teacher)]">
                  Loading payment data...
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[var(--background-color-teacher)] group/design-root overflow-x-hidden">
        <div className="flex h-full grow flex-row">
          <TeacherSidebar />
          <main className="flex-1 bg-[var(--background-color-teacher)] p-8">
            <div className="max-w-5xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800">{error}</p>
              </div>
              <Button onClick={fetchTeacherData}>Retry</Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[var(--background-color-teacher)] group/design-root overflow-x-hidden">
      <div className="flex h-full grow flex-row">
        <TeacherSidebar />
        <main className="flex-1 bg-[var(--background-color-teacher)] p-8">
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <h1 className="text-[var(--text-primary-teacher)] text-3xl font-bold leading-tight tracking-tight">
                Teacher Dashboard
              </h1>
              <p className="text-[var(--text-secondary-teacher)] text-base font-normal leading-normal">
                Overview of your class payment information
              </p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 mb-8">
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-[var(--card-background-color-teacher)] shadow-lg border border-[var(--border-color-teacher)] transition-all hover:shadow-xl">
                <p className="text-[var(--text-secondary-teacher)] text-base font-medium leading-normal">
                  Total Payments Received
                </p>
                <p className="text-[var(--text-primary-teacher)] tracking-tight text-3xl font-bold leading-tight">
                  RM{stats.totalPaymentsReceived.toLocaleString()}
                </p>
                <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary-color-teacher)]"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-[var(--card-background-color-teacher)] shadow-lg border border-[var(--border-color-teacher)] transition-all hover:shadow-xl">
                <p className="text-[var(--text-secondary-teacher)] text-base font-medium leading-normal">
                  Outstanding Payments
                </p>
                <p className="text-[var(--text-primary-teacher)] tracking-tight text-3xl font-bold leading-tight">
                  RM{stats.totalOutstandingPayments.toLocaleString()}
                </p>
                <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--pending-text-color-teacher)]"
                    style={{ width: "25%" }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-[var(--card-background-color-teacher)] shadow-lg border border-[var(--border-color-teacher)] transition-all hover:shadow-xl">
                <p className="text-[var(--text-secondary-teacher)] text-base font-medium leading-normal">
                  Students Paid
                </p>
                <p className="text-[var(--text-primary-teacher)] tracking-tight text-3xl font-bold leading-tight">
                  {stats.studentsPaidCount}
                  <span className="text-slate-500 text-2xl">
                    /{stats.totalStudents}
                  </span>
                </p>
                <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--paid-text-color-teacher)]"
                    style={{ width: `${stats.totalStudents > 0 ? (stats.studentsPaidCount / stats.totalStudents) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h2 className="text-[var(--text-primary-teacher)] text-2xl font-semibold leading-tight tracking-tight mb-6">
                Student Payment Status
              </h2>
              <div className="@container">
                <div className="overflow-x-auto rounded-xl border border-[var(--border-color-teacher)] bg-[var(--card-background-color-teacher)] shadow-lg">
                  <table className="min-w-full w-full table-auto">
                    <thead className="bg-slate-100">
                      <tr>
                        <th
                          className="px-6 py-4 text-left text-slate-600 text-xs font-semibold uppercase tracking-wider"
                          scope="col"
                        >
                          Student Name
                        </th>
                        <th
                          className="px-6 py-4 text-left text-slate-600 text-xs font-semibold uppercase tracking-wider"
                          scope="col"
                        >
                          Class Name
                        </th>
                        <th
                          className="px-6 py-4 text-left text-slate-600 text-xs font-semibold uppercase tracking-wider"
                          scope="col"
                        >
                          Amount Paid
                        </th>
                        <th
                          className="px-6 py-4 text-left text-slate-600 text-xs font-semibold uppercase tracking-wider"
                          scope="col"
                        >
                          Date of Payment
                        </th>
                        <th
                          className="px-6 py-4 text-left text-slate-600 text-xs font-semibold uppercase tracking-wider"
                          scope="col"
                        >
                          Payment Status
                        </th>
                        <th
                          className="px-6 py-4 text-left text-slate-600 text-xs font-semibold uppercase tracking-wider"
                          scope="col"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color-teacher)]">
                      {renderStudentPaymentStatus()}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex justify-center gap-4">
                  <Button
                    onClick={() =>
                      setDisplayLimit((prev) =>
                        Math.min(prev + 5, payments.length)
                      )
                    }
                    disabled={displayLimit >= payments.length}
                  >
                    Show More
                  </Button>
                  <Button
                    onClick={() => setDisplayLimit(initialDisplayLimit)}
                    disabled={displayLimit <= initialDisplayLimit}
                  >
                    Show Less
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}