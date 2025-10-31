"use client"
import Link from "next/link"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"
import { Filter, Plus, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

export default function TreasurerPendingPaymentsPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-[var(--background-light-treasurer-pending)]">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType={"treasurer"} />
        <main className="px-4 sm:px-6 lg:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <h1 className="text-[var(--text-primary-treasurer-pending)] text-2xl md:text-3xl font-bold tracking-tight">
                Pending Payments
              </h1>
              <div className="flex items-center gap-2">
                <button className="btn-secondary-pending flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
                  <Filter className="w-5 h-5" />
                  Filter
                </button>
                <button className="btn-primary-pending flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium">
                  <Plus className="w-5 h-5" />
                  New Payment
                </button>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-xl overflow-hidden @container">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-120 px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary-treasurer-pending)] uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-240 px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary-treasurer-pending)] uppercase tracking-wider">
                        Class
                      </th>
                      <th className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-360 px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary-treasurer-pending)] uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-480 px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary-treasurer-pending)] uppercase tracking-wider">
                        Date
                      </th>
                      <th className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-600 px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary-treasurer-pending)] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-720 px-6 py-4 text-left text-xs font-semibold text-[var(--text-secondary-treasurer-pending)] uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-light-treasurer-pending)]">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-120 px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-treasurer-pending)]">
                        Ethan Harper
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-240 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        Grade 5
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-360 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        $50.00
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-480 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        2024-01-15
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-600 px-6 py-4 whitespace-nowrap text-sm">
                        <span className="status-pending-treasurer-pending">Pending</span>
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-720 px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          className="text-[var(--primary-color-treasurer-pending)] hover:text-[var(--primary-color-hover-treasurer-pending)] font-medium flex items-center gap-1"
                          href="/treasurer/payment-details"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-120 px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-treasurer-pending)]">
                        Olivia Bennett
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-240 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        Grade 3
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-360 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        $75.00
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-480 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        2024-01-16
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-600 px-6 py-4 whitespace-nowrap text-sm">
                        <span className="status-pending-treasurer-pending">Pending</span>
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-720 px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          className="text-[var(--primary-color-treasurer-pending)] hover:text-[var(--primary-color-hover-treasurer-pending)] font-medium flex items-center gap-1"
                          href="/treasurer/payment-details"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-120 px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-treasurer-pending)]">
                        Noah Carter
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-240 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        Grade 7
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-360 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        $100.00
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-480 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        2024-01-17
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-600 px-6 py-4 whitespace-nowrap text-sm">
                        <span className="status-pending-treasurer-pending">Pending</span>
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-720 px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          className="text-[var(--primary-color-treasurer-pending)] hover:text-[var(--primary-color-hover-treasurer-pending)] font-medium flex items-center gap-1"
                          href="/treasurer/payment-details"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-120 px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-treasurer-pending)]">
                        Ava Davis
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-240 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        Grade 2
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-360 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        $60.00
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-480 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        2024-01-18
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-600 px-6 py-4 whitespace-nowrap text-sm">
                        <span className="status-pending-treasurer-pending">Pending</span>
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-720 px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          className="text-[var(--primary-color-treasurer-pending)] hover:text-[var(--primary-color-hover-treasurer-pending)] font-medium flex items-center gap-1"
                          href="/treasurer/payment-details"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-120 px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-treasurer-pending)]">
                        Liam Evans
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-240 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        Grade 6
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-360 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        $85.00
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-480 px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-treasurer-pending)]">
                        2024-01-19
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-600 px-6 py-4 whitespace-nowrap text-sm">
                        <span className="status-pending-treasurer-pending">Pending</span>
                      </td>
                      <td className="table-2ad6bdc5-2b31-4b80-a4a4-c3f98541acae-column-720 px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          className="text-[var(--primary-color-treasurer-pending)] hover:text-[var(--primary-color-hover-treasurer-pending)] font-medium flex items-center gap-1"
                          href="/treasurer/payment-details"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <nav aria-label="Pagination" className="inline-flex -space-x-px rounded-md shadow-sm bg-white">
                <Link
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-l-md border border-gray-300"
                  href="#"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span className="sr-only">Previous</span>
                </Link>
                <Link
                  aria-current="page"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-[var(--primary-color-treasurer-pending)] bg-blue-50 border border-gray-300 z-10"
                  href="#"
                >
                  1
                </Link>
                <Link
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 border border-gray-300"
                  href="#"
                >
                  2
                </Link>
                <Link
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 border border-gray-300"
                  href="#"
                >
                  3
                </Link>
                <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300">
                  ...
                </span>
                <Link
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 border border-gray-300"
                  href="#"
                >
                  8
                </Link>
                <Link
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 border border-gray-300"
                  href="#"
                >
                  9
                </Link>
                <Link
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 border border-gray-300"
                  href="#"
                >
                  10
                </Link>
                <Link
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-r-md border border-gray-300"
                  href="#"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </nav>
            </div>
          </div>
        </main>
        <MainFooter userType="treasurer" activePath="/treasurer/pending-payments" />
      </div>
    </div>
  )
}
