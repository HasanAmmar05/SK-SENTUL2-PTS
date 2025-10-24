"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getTeacherPaymentById } from "@/lib/teacher-data"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Button } from "@/components/ui/button" // Assuming Button is available from shadcn/ui

export default function TeacherPaymentDetailsPage() {
  const params = useParams()
  const paymentId = params.id as string
  const payment = getTeacherPaymentById(paymentId)

  if (!payment) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[var(--background-color-teacher)] group/design-root overflow-x-hidden">
        <div className="flex h-full grow flex-row">
          <TeacherSidebar />
          <main className="flex-1 bg-[var(--background-color-teacher)] p-8">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-[var(--text-primary-teacher)] text-3xl font-bold leading-tight">Payment Not Found</h1>
              <p className="text-[var(--text-secondary-teacher)] mt-4">
                The payment details for ID &quot;{paymentId}&quot; could not be found.
              </p>
              <Link href="/teacher/payments" passHref>
                <Button className="mt-6">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    )
  }

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

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[var(--background-color-teacher)] group/design-root overflow-x-hidden">
      <div className="flex h-full grow flex-row">
        <TeacherSidebar />
        <main className="flex-1 bg-[var(--background-color-teacher)] p-8">
          <div className="max-w-3xl mx-auto bg-[var(--card-background-color-teacher)] rounded-xl shadow-lg border border-[var(--border-color-teacher)] p-8">
            <header className="mb-6 flex items-center justify-between">
              <h1 className="text-[var(--text-primary-teacher)] text-3xl font-bold leading-tight">Payment Details</h1>
              <Link href="/teacher/payments" passHref>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Payments
                </Button>
              </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[var(--text-primary-teacher)]">
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary-teacher)]">Student Name</p>
                <p className="text-lg font-semibold">{payment.studentName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary-teacher)]">Class Name</p>
                <p className="text-lg font-semibold">{payment.className}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary-teacher)]">Amount</p>
                <p className="text-lg font-semibold">RM{payment.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary-teacher)]">Date of Payment</p>
                <p className="text-lg font-semibold">{payment.dateOfPayment}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-secondary-teacher)]">Status</p>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${getStatusColors(payment.status)}`}
                >
                  {payment.status}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h2 className="text-[var(--text-primary-teacher)] text-xl font-semibold mb-4">Payment Proof</h2>
              {payment.paymentProof ? (
                <img
                  src={payment.paymentProof || "/placeholder.svg"}
                  alt={`Payment proof for ${payment.studentName}`}
                  className="max-w-full h-auto rounded-lg border border-[var(--border-color-teacher)] shadow-sm"
                />
              ) : (
                <p className="text-[var(--text-secondary-teacher)]">No payment proof available.</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
