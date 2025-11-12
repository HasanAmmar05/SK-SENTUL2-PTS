"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"
import { Search, Plus } from "lucide-react"
import { allHistoricalPaymentData, type HistoricalPaymentData } from "@/lib/data"

export default function HistoricalPaymentsPage() {
  const [gradeFilter, setGradeFilter] = useState("")
  const [rejectedCheckbox, setRejectedCheckbox] = useState(true) // Default to showing rejected
  const [partiallyPaidCheckbox, setPartiallyPaidCheckbox] = useState(false)
  const [completedCheckbox, setCompletedCheckbox] = useState(true) // Default to showing approved/completed
  const [parentNameSearch, setParentNameSearch] = useState("")
  const [filteredPayments, setFilteredPayments] = useState<HistoricalPaymentData[]>([])
  const [displayedCount, setDisplayedCount] = useState(0)
  const [isFullTableDisplayed, setIsFullTableDisplayed] = useState(false)

  useEffect(() => {
    filterAndRenderPayments()
  }, [gradeFilter, rejectedCheckbox, partiallyPaidCheckbox, completedCheckbox, parentNameSearch])

  const filterAndRenderPayments = () => {
    const selectedGrade = gradeFilter
    const filterStatuses: string[] = []
    if (rejectedCheckbox) filterStatuses.push("rejected")
    if (partiallyPaidCheckbox) filterStatuses.push("partial")
    if (completedCheckbox) filterStatuses.push("completed")
    const searchTerm = parentNameSearch.toLowerCase()

    const newFilteredData = allHistoricalPaymentData.filter((payment) => {
      const rowParentName = payment.parentName.toLowerCase()
      const rowGrade = payment.grade
      const rowStatus = payment.status

      const gradeMatch = selectedGrade === "" || rowGrade === selectedGrade
      const statusMatch = filterStatuses.length === 0 || filterStatuses.includes(rowStatus)
      const parentNameMatch = rowParentName.includes(searchTerm)

      return gradeMatch && statusMatch && parentNameMatch
    })

    setFilteredPayments(newFilteredData)
    setIsFullTableDisplayed(false) // Reset to show limited view on new filter
    setDisplayedCount(Math.min(5, newFilteredData.length))
  }

  const handleShowMore = () => {
    setIsFullTableDisplayed(true)
    setDisplayedCount(filteredPayments.length)
  }

  const renderTableRows = () => {
    const paymentsToDisplay = isFullTableDisplayed ? filteredPayments : filteredPayments.slice(0, 5)

    return paymentsToDisplay.map((payment, index) => {
      let statusClass = ""
      let statusText = ""
      if (payment.status === "completed") {
        statusClass = "status-completed"
        statusText = "Completed"
      } else if (payment.status === "pending") {
        statusClass = "status-pending-historical"
        statusText = "Pending"
      } else if (payment.status === "partial") {
        statusClass = "status-pending-historical" // Using pending style for partial as per original
        statusText = "Partially Paid"
      } else if (payment.status === "rejected") {
        statusClass = "status-rejected-historical"
        statusText = "Rejected"
      }

      return (
        <tr key={index} className="table-hover-row payment-row">
          <td className="table-col-date px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-historical)]">
            {payment.paymentDate}
          </td>
          <td className="table-col-parent px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-historical)]">
            {payment.parentName}
          </td>
          <td className="table-col-children px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-historical)]">
            {payment.children}
          </td>
          <td className="table-col-amount px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary-historical)]">
            MYR {payment.totalAmount.toFixed(2)}
          </td>
          <td className="table-col-status px-6 py-4 whitespace-nowrap">
            <span className={`status-badge ${statusClass}`}>{statusText}</span>
          </td>
          <td className="table-col-actions px-6 py-4 whitespace-nowrap text-right">
            <Link
              className="text-[var(--primary-color-historical)] hover:text-[var(--primary-hover-color-historical)] text-sm font-medium"
              href="/treasurer/payment-details"
            >
              View Details
            </Link>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-[var(--background-color-historical)]">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="treasurer" activePath="/treasurer/historical-payments" />
        <main className="px-4 sm:px-6 md:px-10 lg:px-16 xl:px-24 flex flex-1 justify-center py-10">
          <div className="layout-content-container flex flex-col w-full max-w-7xl flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 px-1">
              <h1 className="text-[var(--text-primary-historical)] text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                Payment History
              </h1>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    className="pl-10 pr-4 py-2.5 border border-[var(--border-color-historical)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--primary-color-historical)] focus:border-[var(--primary-color-historical)] transition-shadow w-full sm:w-64"
                    placeholder="Search by Parent Name"
                    type="text"
                    id="parentNameSearch"
                    value={parentNameSearch}
                    onChange={(e) => setParentNameSearch(e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-[var(--text-secondary-historical)]" />
                  </div>
                </div>
                <button className="flex items-center gap-2 bg-[var(--primary-color-historical)] hover:bg-[var(--primary-hover-color-historical)] text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors">
                  <Plus className="w-5 h-5" />
                  New Payment
                </button>
              </div>
            </div>
            <div className="mb-6 px-1">
              <div className="flex flex-wrap items-center gap-4">
                <select
                  id="gradeFilter"
                  className="filter-dropdown px-4 py-2.5 border border-[var(--border-color-historical)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--primary-color-historical)] focus:border-[var(--primary-color-historical)]"
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                >
                  <option value="">All Grades</option>
                  <option value="1">Grade 1</option>
                  <option value="2">Grade 2</option>
                  <option value="3">Grade 3</option>
                  <option value="4">Grade 4</option>
                  <option value="5">Grade 5</option>
                  <option value="6">Grade 6</option>
                </select>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-[var(--primary-color-historical)] rounded"
                      id="rejectedCheckbox"
                      checked={rejectedCheckbox}
                      onChange={(e) => setRejectedCheckbox(e.target.checked)}
                    />
                    <span className="ml-2 text-[var(--text-secondary-historical)]">Rejected</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-[var(--primary-color-historical)] rounded"
                      id="partiallyPaidCheckbox"
                      checked={partiallyPaidCheckbox}
                      onChange={(e) => setPartiallyPaidCheckbox(e.target.checked)}
                    />
                    <span className="ml-2 text-[var(--text-secondary-historical)]">Partially Paid</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-[var(--primary-color-historical)] rounded"
                      id="completedCheckbox"
                      checked={completedCheckbox}
                      onChange={(e) => setCompletedCheckbox(e.target.checked)}
                    />
                    <span className="ml-2 text-[var(--text-secondary-historical)]">Completed</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="bg-[var(--card-background-color-historical)] shadow-xl rounded-xl overflow-hidden @container">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]" id="paymentTable">
                  <thead className="bg-[var(--table-header-background-historical)]">
                    <tr>
                      <th className="table-col-date px-6 py-4 text-left text-[var(--text-secondary-historical)] text-xs font-semibold uppercase tracking-wider">
                        Payment Date
                      </th>
                      <th className="table-col-parent px-6 py-4 text-left text-[var(--text-secondary-historical)] text-xs font-semibold uppercase tracking-wider">
                        Parent Name
                      </th>
                      <th className="table-col-children px-6 py-4 text-left text-[var(--text-secondary-historical)] text-xs font-semibold uppercase tracking-wider">
                        Children
                      </th>
                      <th className="table-col-amount px-6 py-4 text-left text-[var(--text-secondary-historical)] text-xs font-semibold uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="table-col-status px-6 py-4 text-left text-[var(--text-secondary-historical)] text-xs font-semibold uppercase tracking-wider">
                        Status
                      </th>
                      <th className="table-col-details px-6 py-4 text-left text-[var(--text-secondary-historical)] text-xs font-semibold uppercase tracking-wider w-36"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color-historical)]" id="paymentTableBody">
                    {renderTableRows()}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-1">
              <span className="text-sm text-[var(--text-secondary-historical)]">
                Showing <span className="font-medium text-[var(--text-primary-historical)]">{displayedCount}</span> of{" "}
                <span className="font-medium text-[var(--text-primary-historical)]">{filteredPayments.length}</span>{" "}
                results
              </span>
              {!isFullTableDisplayed && filteredPayments.length > 5 && (
                <button id="showMoreButton" className="show-more-button" onClick={handleShowMore}>
                  Show More
                </button>
              )}
            </div>
          </div>
        </main>
        <MainFooter userType="treasurer" activePath="/treasurer/historical-payments" />
      </div>
    </div>
  )
}
