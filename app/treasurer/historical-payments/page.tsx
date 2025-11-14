"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"
import { Search, Plus, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

interface Payment {
  id: string
  parent_id: string
  student_name: string
  grade: string
  amount: number
  status: "Approved" | "Rejected"
  processed_at: string
}

export default function HistoricalPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [displayedCount, setDisplayedCount] = useState(0)
  const [isFullTableDisplayed, setIsFullTableDisplayed] = useState(false)

  const [gradeFilter, setGradeFilter] = useState("")
  const [rejectedCheckbox, setRejectedCheckbox] = useState(false)
  const [approvedCheckbox, setApprovedCheckbox] = useState(false)
  const [parentNameSearch, setParentNameSearch] = useState("")

  useEffect(() => {
  const fetchPayments = async () => {
    setLoading(true)

    try {
      const { data: approved, error: approvedError } = await supabase
        .from("approved_payments")
        .select("*")

      const { data: rejected, error: rejectedError } = await supabase
        .from("rejected_payments")
        .select("*")

      if (approvedError) {
        console.error("Error fetching approved payments:", approvedError.message)
      }
      if (rejectedError) {
        console.error("Error fetching rejected payments:", rejectedError.message)
      }

      const approvedData = (approved || []).map((p: any) => {
        console.log('Approved payment raw data:', p);
        // Check if submitpayment_id exists, if not, the record might be old
        const paymentId = p.submitpayment_id || p.id || "";
        if (!p.submitpayment_id) {
          console.warn('Warning: approved payment missing submitpayment_id:', p);
        }
        return {
          id: paymentId,
          parent_id: p.parent_id || "",
          student_name: p.student_name || "",
          grade: p.grade || "",
          amount: p.amount || 0,
          status: "Approved" as const,
          processed_at: p.approved_at || p.created_at || new Date().toISOString(),
        };
      })

      const rejectedData = (rejected || []).map((p: any) => {
        console.log('Rejected payment raw data:', p);
        // Check if submitpayment_id exists, if not, the record might be old
        const paymentId = p.submitpayment_id || p.id || "";
        if (!p.submitpayment_id) {
          console.warn('Warning: rejected payment missing submitpayment_id:', p);
        }
        return {
          id: paymentId,
          parent_id: p.parent_id || "",
          student_name: p.student_name || "",
          grade: p.grade || "",
          amount: p.amount || 0,
          status: "Rejected" as const,
          processed_at: p.rejected_at || p.created_at || new Date().toISOString(),
        };
      })

      const combined = [...approvedData, ...rejectedData].sort(
        (a, b) => new Date(b.processed_at).getTime() - new Date(a.processed_at).getTime(),
      )
      setPayments(combined)
    } catch (error) {
      console.error("Error fetching payments:", error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  fetchPayments()
}, [])

  const filteredPayments = useMemo(() => {
    const selectedGrade = gradeFilter
    const filterStatuses: string[] = []
    if (rejectedCheckbox) filterStatuses.push("Rejected")
    if (approvedCheckbox) filterStatuses.push("Approved")
    const searchTerm = parentNameSearch.toLowerCase()

    return payments.filter((payment) => {
      const gradeMatch = selectedGrade === "" || payment.grade === selectedGrade
      const statusMatch = filterStatuses.length === 0 || filterStatuses.includes(payment.status)
      const nameMatch = payment.student_name.toLowerCase().includes(searchTerm)

      return gradeMatch && statusMatch && nameMatch
    })
  }, [payments, gradeFilter, rejectedCheckbox, approvedCheckbox, parentNameSearch])

  useEffect(() => {
    setIsFullTableDisplayed(false)
    setDisplayedCount(Math.min(5, filteredPayments.length))
  }, [gradeFilter, rejectedCheckbox, approvedCheckbox, parentNameSearch, filteredPayments.length])

  const handleShowMore = () => {
    setIsFullTableDisplayed(true)
    setDisplayedCount(filteredPayments.length)
  }

  const renderTableRows = () => {
    const paymentsToDisplay = isFullTableDisplayed ? filteredPayments : filteredPayments.slice(0, 5)

    if (loading) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--text-secondary-historical)]">
            Loading payments...
          </td>
        </tr>
      )
    }

    if (paymentsToDisplay.length === 0) {
      return (
        <tr>
          <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--text-secondary-historical)]">
            No payments found.
          </td>
        </tr>
      )
    }

    return paymentsToDisplay.map((payment) => {
      let statusClass = ""
      let statusText = ""
      if (payment.status === "Approved") {
        statusClass = "status-completed"
        statusText = "Approved"
      } else if (payment.status === "Rejected") {
        statusClass = "status-rejected-historical"
        statusText = "Rejected"
      }

      return (
        <tr key={payment.id} className="table-hover-row payment-row">
          <td className="table-col-date px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-historical)]">
            {new Date(payment.processed_at).toLocaleDateString()}
          </td>
          <td className="table-col-parent px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-historical)]">
            {payment.student_name}
          </td>
          <td className="table-col-children px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-historical)]">
            Grade {payment.grade}
          </td>
          <td className="table-col-amount px-6 py-4 whitespace-nowrap text-sm text-[var(--text-primary-historical)]">
            MYR {payment.amount.toFixed(2)}
          </td>
          <td className="table-col-status px-6 py-4 whitespace-nowrap">
            <span className={`status-badge ${statusClass}`}>{statusText}</span>
          </td>
          <td className="table-col-actions px-6 py-4 whitespace-nowrap text-right">
            <Link
              href={`/treasurer/payment-details?id=${payment.id}`}
              className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              View Details <ArrowRight size={15} />
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
                    placeholder="Search by Student Name"
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
                      id="approvedCheckbox"
                      checked={approvedCheckbox}
                      onChange={(e) => setApprovedCheckbox(e.target.checked)}
                    />
                    <span className="ml-2 text-[var(--text-secondary-historical)]">Approved</span>
                  </label>
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
                        Student Name
                      </th>
                      <th className="table-col-children px-6 py-4 text-left text-[var(--text-secondary-historical)] text-xs font-semibold uppercase tracking-wider">
                        Grade
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