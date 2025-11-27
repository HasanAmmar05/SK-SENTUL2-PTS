"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getTeacherPaymentById, TeacherPayment } from "@/app/teacher/actions"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function TeacherPaymentDetailsPage() {
  const params = useParams()
  const paymentId = params.id as string
  const [payment, setPayment] = useState<TeacherPayment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentDetails()
  }, [paymentId])

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getTeacherPaymentById(paymentId)
      setPayment(result)
    } catch (err) {
      console.error("Failed to fetch payment details:", err)
      setError("Failed to load payment details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[var(--background-color-teacher)] group/design-root overflow-x-hidden">
        <div className="flex h-full grow flex-row">
          <TeacherSidebar />
          <main className="flex-1 bg-[var(--background-color-teacher)] p-8">
            <div className="max-w-5xl mx-auto flex items-center justify-center h-64">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-[var(--primary-color-teacher)]" />
                <span className="text-[var(--text-primary-teacher)]">Loading payment details...</span>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-[var(--background-color-teacher)] group/design-root overflow-x-hidden">
        <div className="flex h-full grow flex-row">
          <TeacherSidebar />
          <main className="flex-1 bg-[var(--background-color-teacher)] p-8">
            <div className="max-w-5xl mx-auto">
              <h1 className="text-[var(--text-primary-teacher)] text-3xl font-bold leading-tight">Payment Not Found</h1>
              <p className="text-[var(--text-secondary-teacher)] mt-4">
                {error || `The payment details for ID "${paymentId}" could not be found.`}
              </p>
              <Link href="/teacher/dashboard" passHref>
                <Button className="mt-6">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
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
              <Link href="/teacher/dashboard" passHref>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
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
              {payment.status === "Confirmed" && (
                <div className="mt-4">
                  <Link href={`/receipts/${payment.id}`} passHref>
                    <Button>Download Receipt</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
