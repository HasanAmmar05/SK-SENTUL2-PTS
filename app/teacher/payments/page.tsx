"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Search, Circle } from "lucide-react"
import { getAllTeacherPayments } from "@/lib/teacher-data"
import { Button } from "@/components/ui/button" // Assuming Button is available from shadcn/ui

export default function TeacherClassPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Increased items per page for better view

  const allPayments = getAllTeacherPayments()

  const filteredPayments = allPayments.filter(
    (payment) =>
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.className.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPayments = filteredPayments.slice(startIndex, endIndex)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page on search
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
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
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <h1 className="text-[var(--text-primary-teacher)] text-3xl font-bold leading-tight">Class Payments</h1>
            </header>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[var(--text-primary-teacher)] text-xl font-semibold leading-tight">All Payments</h2>
              <div className="relative">
                <input
                  className="w-64 rounded-lg border-[var(--border-color-teacher)] py-2 pl-10 pr-4 text-sm focus:border-[var(--primary-color-teacher)] focus:ring-[var(--primary-color-teacher)]"
                  placeholder="Search students or class..."
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-secondary-teacher)]">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--border-color-teacher)] bg-white shadow-sm">
              <table className="min-w-full divide-y divide-[var(--border-color-teacher)]">
                <thead className="bg-gray-50 table-header">
                  <tr>
                    <th
                      className="w-1/5 px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-primary-teacher)]"
                      scope="col"
                    >
                      Student Name
                    </th>
                    <th
                      className="w-1/5 px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-primary-teacher)]"
                      scope="col"
                    >
                      Class Name
                    </th>
                    <th
                      className="w-1/6 px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-primary-teacher)]"
                      scope="col"
                    >
                      Amount (RM)
                    </th>
                    <th
                      className="w-1/6 px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-primary-teacher)]"
                      scope="col"
                    >
                      Date of Payment
                    </th>
                    <th
                      className="w-1/6 px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-[var(--text-primary-teacher)]"
                      scope="col"
                    >
                      Status
                    </th>
                    <th
                      className="w-1/12 px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-[var(--text-primary-teacher)]"
                      scope="col"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color-teacher)] bg-white">
                  {currentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-teacher)]">
                        {payment.studentName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-teacher)]">
                        {payment.className}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-teacher)]">
                        RM{payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-teacher)]">
                        {payment.dateOfPayment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusColors(payment.status)}`}
                        >
                          <Circle className="mr-1.5 h-2.5 w-2.5 fill-current" />
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/teacher/payment-details/${payment.id}`} passHref>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-[var(--text-secondary-teacher)]">
                Showing {`${startIndex + 1}`} to {`${Math.min(endIndex, filteredPayments.length)}`} of{" "}
                {`${filteredPayments.length}`} results
              </p>
              <div className="flex items-center gap-x-2">
                <Button
                  className="rounded-md border border-[var(--border-color-teacher)] px-3 py-1.5 text-sm text-[var(--text-secondary-teacher)] hover:bg-gray-100 disabled:opacity-50"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  className="rounded-md border border-[var(--border-color-teacher)] px-3 py-1.5 text-sm text-[var(--text-secondary-teacher)] hover:bg-gray-100 disabled:opacity-50"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
