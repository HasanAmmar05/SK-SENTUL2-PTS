"use client"
import Link from "next/link"
import { useState } from "react"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { teacherDashboardData, getAllTeacherPayments } from "@/lib/teacher-data"
import { Button } from "@/components/ui/button"

export default function TeacherDashboardPage() {
  const { totalPaymentsReceived, totalOutstandingPayments } = teacherDashboardData
  const allPayments = getAllTeacherPayments()
  const studentsPaidCount = allPayments.filter((p) => p.status === "Confirmed").length
  const totalStudents = allPayments.length

  const initialDisplayLimit = 5
  const [displayLimit, setDisplayLimit] = useState(initialDisplayLimit)

  const getStatusColors = (status: "Confirmed" | "Pending" | "Rejected") => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStudentPaymentStatus = () => {
    const paymentsToDisplay = allPayments
      .sort((a, b) => new Date(b.dateOfPayment).getTime() - new Date(a.dateOfPayment).getTime())
      .slice(0, displayLimit)

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
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColors(student.status)}`}
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
      )
    })
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
                  RM{totalPaymentsReceived.toLocaleString()}
                </p>
                <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--primary-color-teacher)]" style={{ width: "75%" }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-[var(--card-background-color-teacher)] shadow-lg border border-[var(--border-color-teacher)] transition-all hover:shadow-xl">
                <p className="text-[var(--text-secondary-teacher)] text-base font-medium leading-normal">
                  Outstanding Payments
                </p>
                <p className="text-[var(--text-primary-teacher)] tracking-tight text-3xl font-bold leading-tight">
                  RM{totalOutstandingPayments.toLocaleString()}
                </p>
                <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--pending-text-color-teacher)]" style={{ width: "25%" }}></div>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-[var(--card-background-color-teacher)] shadow-lg border border-[var(--border-color-teacher)] transition-all hover:shadow-xl">
                <p className="text-[var(--text-secondary-teacher)] text-base font-medium leading-normal">
                  Students Paid
                </p>
                <p className="text-[var(--text-primary-teacher)] tracking-tight text-3xl font-bold leading-tight">
                  {studentsPaidCount}
                  <span className="text-slate-500 text-2xl">/{totalStudents}</span>
                </p>
                <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--paid-text-color-teacher)]"
                    style={{ width: `calc(${studentsPaidCount} / ${totalStudents} * 100%)` }}
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
                    onClick={() => setDisplayLimit((prev) => Math.min(prev + 5, allPayments.length))}
                    disabled={displayLimit >= allPayments.length}
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
  )
}
