"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { MainHeader } from "@/components/main-header"
import { supabase } from "@/lib/supabase-client"
import AuthWrapper from "@/components/auth-wrapper"
import { Filter, DollarSign, ArrowDown, Clock, CheckCircle, Search } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

interface Payment {
  id: string
  student_name: string
  grade: string
  amount: number
  created_at: string
  status: "Pending" | "Approved" | "Rejected"
  parent_id: string
}

interface Profile {
  id: string
  full_name: string
}

export default function TreasurerDashboardPage() {
  return (
    <AuthWrapper>
      <TreasurerDashboardContent />
    </AuthWrapper>
  )
}

function TreasurerDashboardContent() {
  const [filterSectionVisible, setFilterSectionVisible] = useState(false)
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

  const [payments, setPayments] = useState<Payment[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
  const fetchData = async () => {
    setLoading(true)

    // Fetch all tables
    const { data: pendingData } = await supabase
      .from("submitpayment")
      .select("*")

    const { data: approvedData } = await supabase
      .from("approved_payments")
      .select("*")

    const { data: rejectedData } = await supabase
      .from("rejected_payments")
      .select("*")

    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, full_name")

    // Use submitpayment ID for pending payments (their own ID)
    const normalizedPending: Payment[] =
      pendingData?.map((p) => ({
        id: p.id,
        student_name: p.student_name,
        grade: p.grade,
        amount: p.amount,
        created_at: p.created_at,
        status: "Pending",
        parent_id: p.parent_id,
      })) ?? [];

    // Use submitpayment_id for approved payments (reference to original)
    const normalizedApproved: Payment[] =
      approvedData?.map((p) => ({
        id: p.submitpayment_id || p.id, // Use submitpayment_id for linking
        student_name: p.student_name,
        grade: p.grade,
        amount: p.amount,
        created_at: p.approved_at ?? p.created_at,
        status: "Approved",
        parent_id: p.parent_id,
      })) ?? [];

    // Use submitpayment_id for rejected payments (reference to original)
    const normalizedRejected: Payment[] =
      rejectedData?.map((p) => ({
        id: p.submitpayment_id || p.id, // Use submitpayment_id for linking
        student_name: p.student_name,
        grade: p.grade,
        amount: p.amount,
        created_at: p.rejected_at ?? p.created_at,
        status: "Rejected",
        parent_id: p.parent_id,
      })) ?? [];

    const allPayments = [
      ...normalizedPending,
      ...normalizedApproved,
      ...normalizedRejected,
    ];

    setPayments(allPayments)
    setProfiles(profilesData ?? [])
    setLoading(false);
  }

  fetchData()
}, [])

  const getParentName = (parentId: string): string => {
    const profile = profiles.find((p) => p.id === parentId)
    return profile ? profile.full_name : "Unknown"
  }

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Date range filter
      const paymentDate = new Date(payment.created_at).toISOString().split("T")[0]
      const dateMatch = (!startDate || paymentDate >= startDate) && (!endDate || paymentDate <= endDate)

      // Status filter
      let statusMatch = true
      if (paymentStatus) {
        // Map payment status to filter status
        const statusMap: { [key: string]: string } = {
          Approved: "full",
          Pending: "partial",
          Rejected: "rejected",
        }
        statusMatch = statusMap[payment.status] === paymentStatus
      } else {
        const activeFilters = []
        if (rejectedChecked) activeFilters.push("Rejected")
        if (partiallyPaidChecked) activeFilters.push("Pending")
        if (completelyPaidChecked) activeFilters.push("Approved")

        if (activeFilters.length > 0) {
          statusMatch = activeFilters.includes(payment.status)
        }
      }

      // Grade/Class filter
      let classGradeMatch = true
      if (classFilter) {
        classGradeMatch = `Grade ${payment.grade}` === classFilter
      } else if (gradeLevel) {
        classGradeMatch = payment.grade === gradeLevel
      }

      // Amount filter
      const amountMatch =
        (minAmount === "" || payment.amount >= (minAmount as number)) &&
        (maxAmount === "" || payment.amount <= (maxAmount as number))

      // Parent name search
      const parentName = getParentName(payment.parent_id)
      const parentNameMatch = parentName.toLowerCase().includes(parentNameSearch.toLowerCase())

      return dateMatch && statusMatch && classGradeMatch && amountMatch && parentNameMatch
    })
  }, [
    payments,
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
    profiles,
  ])

  const stats = useMemo(() => {
    const totalReceived = filteredPayments.filter((p) => p.status === "Approved").reduce((sum, p) => sum + p.amount, 0)

    const totalToReceive = filteredPayments.reduce((sum, p) => sum + p.amount, 0)

    const partialPaymentsCount = filteredPayments.filter((p) => p.status === "Pending").length
    const fullPaymentsCount = filteredPayments.filter((p) => p.status === "Approved").length

    const totalStudents = filteredPayments.length
    const studentsPaidInFull = filteredPayments.filter((p) => p.status === "Approved").length
    const percentagePaidInFull = totalStudents > 0 ? (studentsPaidInFull / totalStudents) * 100 : 0

    return {
      totalToReceive,
      totalReceived,
      partialPaymentsCount,
      fullPaymentsCount,
      totalStudents,
      studentsPaidInFull,
      percentagePaidInFull,
    }
  }, [filteredPayments])

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

  const renderPaymentOverview = () => {
    const itemsToShow = showAll ? filteredPayments : filteredPayments.slice(0, 5)
    return itemsToShow.map((p) => (
      <tr key={p.id} className="hover:bg-slate-50">
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">{p.student_name}</td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">Grade {p.grade}</td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">{getParentName(p.parent_id)}</td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
          <span className={`status-pill status-${p.status.toLowerCase()}`}>{p.status}</span>
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-red-600 text-right">
          MYR {p.amount.toFixed(2)}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-green-600 text-right">
          MYR {p.status === "Approved" ? p.amount.toFixed(2) : "0.00"}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-amber-500 text-right">
          MYR {p.status !== "Approved" ? p.amount.toFixed(2) : "0.00"}
        </td>
      </tr>
    ))
  }

  const renderRecentPayments = () => {
    const sortedData = [...filteredPayments].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    const itemsToShow = sortedData.slice(0, 6)

    return itemsToShow.map((p) => (
      <tr key={p.id} className="hover:bg-slate-50">
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">{p.student_name}</td>
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-red-600 text-right">
          MYR {p.amount.toFixed(2)}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
          {new Date(p.created_at).toLocaleDateString()}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
          <span className={`status-pill status-${p.status.toLowerCase()}`}>{p.status}</span>
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-right">
          <Link
            href={`/treasurer/payment-details?id=${p.id}`}
            className="text-[var(--primary-color-treasurer-dashboard)] hover:text-[var(--primary-color-treasurer-dashboard)]"
          >
            View Details
          </Link>
        </td>
      </tr>
    ))
  }

  const pieChartData = [
    { name: "Paid in Full", value: stats.studentsPaidInFull, color: "#10b981" },
    { name: "Not Paid in Full", value: stats.totalStudents - stats.studentsPaidInFull, color: "#e2e8f0" },
  ]

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

            {filterSectionVisible && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="startDate">
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)]"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                      <input
                        type="date"
                        className="rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)]"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="paymentStatus">
                      Payment Status
                    </label>
                    <select
                      className="rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)]"
                      id="paymentStatus"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="full">Approved</option>
                      <option value="partial">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="gradeLevel">
                      Grade Level
                    </label>
                    <select
                      className="rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)]"
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
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700" htmlFor="minAmount">
                      Amount Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        className="rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)]"
                        id="minAmount"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value === "" ? "" : Number.parseFloat(e.target.value))}
                      />
                      <input
                        type="number"
                        className="rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)]"
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
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">Total Amount to Receive</p>
                  <span className="text-slate-500">
                    <DollarSign className="w-5 h-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">
                  MYR {stats.totalToReceive.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">Total Amount Received</p>
                  <span className="text-green-500">
                    <ArrowDown className="w-5 h-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">MYR {stats.totalReceived.toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">Partial Payments</p>
                  <span className="text-amber-500">
                    <Clock className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">{stats.partialPaymentsCount}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">Full Payments</p>
                  <span className="text-green-500">
                    <CheckCircle className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">{stats.fullPaymentsCount}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <p className="text-slate-600 text-sm font-medium mb-2">Students Paid in Full</p>
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={80} height={80}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col">
                    <p className="text-slate-900 text-2xl font-bold tracking-tight">
                      {stats.percentagePaidInFull.toFixed(1)}%
                    </p>
                    <p className="text-slate-500 text-xs">
                      {stats.studentsPaidInFull}/{stats.totalStudents} students
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <h2 className="text-slate-900 text-xl font-semibold leading-tight">Student Payment Overview</h2>
                <div className="flex items-center gap-2">
                  <Search className="text-slate-400 w-5 h-5" />
                  <input
                    className="block w-full sm:w-72 rounded-lg border-slate-300 bg-slate-50 py-2.5 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
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
                    className="block w-full sm:w-48 rounded-lg border-slate-300 bg-slate-50 py-2.5 pr-10 text-sm text-slate-900 focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
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
                      className="h-4 w-4 text-[var(--primary-color-treasurer-dashboard)] border-slate-300 rounded focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                      type="checkbox"
                      checked={rejectedChecked}
                      onChange={(e) => setRejectedChecked(e.target.checked)}
                    />
                    <span className="ml-2">Rejected</span>
                  </label>
                  <label className="flex items-center text-sm text-slate-700">
                    <input
                      className="h-4 w-4 text-[var(--primary-color-treasurer-dashboard)] border-slate-300 rounded focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                      type="checkbox"
                      checked={partiallyPaidChecked}
                      onChange={(e) => setPartiallyPaidChecked(e.target.checked)}
                    />
                    <span className="ml-2">Partially Paid</span>
                  </label>
                  <label className="flex items-center text-sm text-slate-700">
                    <input
                      className="h-4 w-4 text-[var(--primary-color-treasurer-dashboard)] border-slate-300 rounded focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                      type="checkbox"
                      checked={completelyPaidChecked}
                      onChange={(e) => setCompletelyPaidChecked(e.target.checked)}
                    />
                    <span className="ml-2">Completely Paid</span>
                  </label>
                </div>
              </div>
              <div className="overflow-x-auto @container">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Parent Name
                      </th>
                      <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Payment Status
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Amount Paid
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Remaining Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      renderPaymentOverview()
                    )}
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
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-slate-900 text-xl font-semibold leading-tight mb-6">Recent Payments</h2>
              <div className="overflow-x-auto @container">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        View Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      renderRecentPayments()
                    )}
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