"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { MainHeader } from "@/components/main-header"
import { Filter, DollarSign, ArrowDown, Clock, CheckCircle, Search } from "lucide-react"
import { allDashboardPaymentData, type PaymentData } from "@/lib/data"
import AuthWrapper from "@/components/auth-wrapper"

export default function TreasurerDashboardPage() {
  return (
    <AuthWrapper>
      <TreasurerDashboardContent />
    </AuthWrapper>
  )
}

function TreasurerDashboardContent() {
  const [filterSectionVisible, setFilterSectionVisible] = useState(false)
  const [filteredPayments, setFilteredPayments] = useState<PaymentData[]>(allDashboardPaymentData) // Initialize with all data
  const [showAll, setShowAll] = useState(false)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [gradeLevel, setGradeLevel] = useState("")
  const [minAmount, setMinAmount] = useState<number | "">("")
  const [maxAmount, setMaxAmount] = useState<number | "">("")
  const [rejectedChecked, setRejectedChecked] = useState(false)
  const [partiallyPaidChecked, setPartiallyPaidChecked] = useState(false)
  const [completelyPaidChecked, setCompletelyPaidChecked] = useState(false)
  const [parentNameSearch, setParentNameSearch] = useState("")
  const [classFilter, setClassFilter] = useState("")

  useEffect(() => {
    applyFilters()
  }, [
    startDate,
    endDate,
    paymentStatus,
    gradeLevel,
    minAmount,
    maxAmount,
    rejectedChecked,
    partiallyPaidChecked,
    completelyPaidChecked,
    parentNameSearch,
    classFilter,
  ])

  const toggleFilters = () => {
    setFilterSectionVisible(!filterSectionVisible)
  }

  const resetFilters = () => {
    setStartDate("")
    setEndDate("")
    setPaymentStatus("")
    setGradeLevel("")
    setMinAmount("")
    setMaxAmount("")
    setRejectedChecked(false)
    setPartiallyPaidChecked(false)
    setCompletelyPaidChecked(false)
    setParentNameSearch("")
    setClassFilter("")
  }

  const applyFilters = () => {
    const filteredData = allDashboardPaymentData.filter((payment) => {
      const dateMatch = (!startDate || payment.date >= startDate) && (!endDate || payment.date <= endDate)

      let statusMatch = true
      if (paymentStatus) {
        statusMatch = payment.status === paymentStatus
      } else {
        const activeFilters = []
        if (rejectedChecked) activeFilters.push("rejected")
        if (partiallyPaidChecked) activeFilters.push("partial")
        if (completelyPaidChecked) activeFilters.push("full")

        if (activeFilters.length > 0) {
          statusMatch = activeFilters.includes(payment.status)
        }
      }

      let classGradeMatch = true
      if (classFilter) {
        classGradeMatch = payment.class === classFilter
      } else if (gradeLevel) {
        classGradeMatch = payment.class === `Grade ${gradeLevel}`
      }

      const amountMatch =
        (minAmount === "" || payment.totalAmount >= (minAmount as number)) &&
        (maxAmount === "" || payment.totalAmount <= (maxAmount as number))

      const parentNameMatch = payment.parentName.toLowerCase().includes(parentNameSearch.toLowerCase())

      return dateMatch && statusMatch && classGradeMatch && amountMatch && parentNameMatch
    })
    setFilteredPayments(filteredData)
  }

  // Calculate totals from all payment data (not filtered)
  const totalToReceive = allDashboardPaymentData.reduce((sum, payment) => sum + payment.remainingAmount, 0)
  const totalReceived = allDashboardPaymentData
    .filter((payment) => payment.status === "full" || payment.status === "partial")
    .reduce((sum, payment) => sum + payment.amountPaid, 0)
  const partialPaymentsCount = allDashboardPaymentData.filter((payment) => payment.status === "partial").length
  const fullPaymentsCount = allDashboardPaymentData.filter((payment) => payment.status === "full").length

  const renderPaymentOverview = () => {
    const itemsToShow = showAll ? filteredPayments : filteredPayments.slice(0, 5)
    return itemsToShow.map((payment, index) => {
      let statusClass = ""
      let statusText = ""
      if (payment.status === "full") {
        statusClass = "status-full"
        statusText = "Full"
      } else if (payment.status === "partial") {
        statusClass = "status-partial"
        statusText = "Partial"
      } else if (payment.status === "rejected") {
        statusClass = "status-rejected"
        statusText = "Rejected"
      }

      return (
        <tr key={index} className="hover:bg-slate-50">
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-120 whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
            {payment.studentName}
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-240 whitespace-nowrap px-4 py-4 text-sm text-slate-500">
            {payment.class}
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-360 whitespace-nowrap px-4 py-4 text-sm text-slate-500">
            {payment.parentName}
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-480 whitespace-nowrap px-4 py-4 text-sm text-center">
            <span className={`status-pill ${statusClass}`}>{statusText}</span>
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-550 whitespace-nowrap px-4 py-4 text-sm font-medium text-red-600">
            MYR {payment.totalAmount.toFixed(2)}
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-600 whitespace-nowrap px-4 py-4 text-sm font-medium text-green-600">
            MYR {payment.amountPaid.toFixed(2)}
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-720 whitespace-nowrap px-4 py-4 text-sm font-medium text-amber-500">
            MYR {payment.remainingAmount.toFixed(2)}
          </td>
        </tr>
      )
    })
  }

  const renderRecentPayments = () => {
    const sortedData = [...filteredPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const itemsToShow = sortedData.slice(0, 6) // Limit to 6 payments

    return itemsToShow.map((payment, index) => {
      let statusClass = ""
      let statusText = ""
      if (payment.status === "full") {
        statusClass = "status-full"
        statusText = "Full Payment"
      } else if (payment.status === "partial") {
        statusClass = "status-partial"
        statusText = "Partial Payment"
      } else if (payment.status === "rejected") {
        statusClass = "status-rejected"
        statusText = "Rejected"
      }

      return (
        <tr key={index} className="hover:bg-slate-50">
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-120 whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
            {payment.studentName}
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-550 whitespace-nowrap px-4 py-4 text-sm font-medium text-red-600">
            MYR {payment.totalAmount.toFixed(2)}
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-360 whitespace-nowrap px-4 py-4 text-sm text-slate-500">
            {payment.date}
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-480 whitespace-nowrap px-4 py-4 text-sm text-center">
            <span className={`status-pill ${statusClass}`}>{statusText}</span>
          </td>
          <td className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-720 whitespace-nowrap px-4 py-4 text-sm font-medium text-right">
            <Link
              href="/treasurer/payment-details"
              className="text-[var(--primary-color-treasurer-dashboard)] hover:text-[var(--primary-color-treasurer-dashboard)]"
            >
              View Details
            </Link>
          </td>
        </tr>
      )
    })
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-slate-100">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="treasurer" activePath="/treasurer/dashboard" />
        <main className="px-6 md:px-10 lg:px-16 xl:px-24 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h1 className="text-slate-900 text-3xl font-bold leading-tight">Treasurer Dashboard</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleFilters}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-offset-2"
                >
                  <Filter className="mr-2 w-5 h-5" />
                  Filters
                </button>
                <Link
                  href="/treasurer/pending-payments"
                  className="inline-flex items-center justify-center rounded-md bg-[var(--primary-color-treasurer-dashboard)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-offset-2 transition-colors duration-150"
                >
                  View Pending Payments
                </Link>
              </div>
            </div>

            {/* Filter Section */}
            <div id="filterSection" className={`filter-section ${filterSectionVisible ? "" : "hidden"}`}>
              <div className="filter-row">
                <div className="filter-group">
                  <label className="filter-label" htmlFor="startDate">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="filter-input"
                      id="startDate"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input
                      type="date"
                      className="filter-input"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="filter-group">
                  <label className="filter-label" htmlFor="paymentStatus">
                    Payment Status
                  </label>
                  <select
                    className="filter-input"
                    id="paymentStatus"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="full">Full Payment</option>
                    <option value="partial">Partial Payment</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label" htmlFor="gradeLevel">
                    Grade Level
                  </label>
                  <select
                    className="filter-input"
                    id="gradeLevel"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                  >
                    <option value="">All Grades</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label" htmlFor="minAmount">
                    Amount Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      className="filter-input"
                      id="minAmount"
                      placeholder="Min"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                    />
                    <input
                      type="number"
                      className="filter-input"
                      id="maxAmount"
                      placeholder="Max"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-offset-2"
                >
                  Reset
                </button>
                <button
                  onClick={applyFilters}
                  className="inline-flex items-center justify-center rounded-md bg-[var(--primary-color-treasurer-dashboard)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-offset-2"
                >
                  Apply Filters
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">Total Amount to Receive</p>
                  <span className="text-slate-500">
                    <DollarSign className="w-5 h-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">MYR {totalToReceive.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">Total Amount Received</p>
                  <span className="text-green-500">
                    <ArrowDown className="w-5 h-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">MYR {totalReceived.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">Partial Payments</p>
                  <span className="text-amber-500">
                    <Clock className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">{partialPaymentsCount}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">Full Payments</p>
                  <span className="text-green-500">
                    <CheckCircle className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">{fullPaymentsCount}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-slate-900 text-xl font-semibold leading-tight">Student Payment Overview</h2>
                <div className="flex items-center gap-2">
                  <Search className="text-slate-400 w-5 h-5" />
                  <input
                    className="form-input block w-full sm:w-72 rounded-lg border-slate-300 bg-slate-50 py-2.5 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                    id="parentNameSearch"
                    placeholder="Search by Parent Name"
                    type="search"
                    value={parentNameSearch}
                    onChange={(e) => setParentNameSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-auto">
                  <select
                    className="form-select block w-full sm:w-48 rounded-lg border-slate-300 bg-slate-50 py-2.5 pr-10 text-sm text-slate-900 focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                    id="classFilter"
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                  >
                    <option value="">Filter by Class</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                    <option value="Grade 6">Grade 6</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center text-sm text-slate-700">
                    <input
                      className="form-checkbox h-4 w-4 text-[var(--primary-color-treasurer-dashboard)] border-slate-300 rounded focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                      id="rejectedFilter"
                      type="checkbox"
                      checked={rejectedChecked}
                      onChange={(e) => setRejectedChecked(e.target.checked)}
                    />
                    <span className="ml-2">Rejected</span>
                  </label>
                  <label className="flex items-center text-sm text-slate-700">
                    <input
                      className="form-checkbox h-4 w-4 text-[var(--primary-color-treasurer-dashboard)] border-slate-300 rounded focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                      id="partiallyPaidFilter"
                      type="checkbox"
                      checked={partiallyPaidChecked}
                      onChange={(e) => setPartiallyPaidChecked(e.target.checked)}
                    />
                    <span className="ml-2">Partially Paid</span>
                  </label>
                  <label className="flex items-center text-sm text-slate-700">
                    <input
                      className="form-checkbox h-4 w-4 text-[var(--primary-color-treasurer-dashboard)] border-slate-300 rounded focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                      id="completelyPaidFilter"
                      type="checkbox"
                      checked={completelyPaidChecked}
                      onChange={(e) => setCompletelyPaidChecked(e.target.checked)}
                    />
                    <span className="ml-2">Completely Paid</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto @container">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-120 px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      scope="col"
                    >
                      Student Name
                    </th>
                    <th
                      className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-240 px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      scope="col"
                    >
                      Class
                    </th>
                    <th
                      className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-360 px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      scope="col"
                    >
                      Parent Name
                    </th>
                    <th
                      className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-480 px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      scope="col"
                    >
                      Payment Status
                    </th>
                    <th
                      className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-550 px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      scope="col"
                    >
                      Total Amount
                    </th>
                    <th
                      className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-600 px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      scope="col"
                    >
                      Amount Paid
                    </th>
                    <th
                      className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-720 px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
                      scope="col"
                    >
                      Remaining Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white" id="paymentOverviewTableBody">
                  {renderPaymentOverview()}
                </tbody>
              </table>
              {filteredPayments.length > 5 && (
                <div className="flex justify-center mt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-offset-2"
                  >
                    {showAll ? "Show Less" : "Show More"}
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-slate-900 text-xl font-semibold leading-tight">Recent Payments</h2>
                <div className="flex items-center gap-2">
                  <Search className="text-slate-400 w-5 h-5" />
                  <input
                    className="form-input block w-full sm:w-72 rounded-lg border-slate-300 bg-slate-50 py-2.5 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                    id="recentPaymentSearch"
                    placeholder="Search by Student Name"
                    type="search"
                    value={parentNameSearch}
                    onChange={(e) => setParentNameSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto @container">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th
                        className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-120 px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                        scope="col"
                      >
                        Student Name
                      </th>
                      <th
                        className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-550 px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
                        scope="col"
                      >
                        Amount
                      </th>
                      <th
                        className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-360 px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider"
                        scope="col"
                      >
                        Date
                      </th>
                      <th
                        className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-480 px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider"
                        scope="col"
                      >
                        Status
                      </th>
                      <th
                        className="table-e8c15146-7f1d-4e60-8d3d-2506ef58b70a-column-720 px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider"
                        scope="col"
                      >
                        View Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white" id="recentPaymentsTableBody">
                    {renderRecentPayments()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
