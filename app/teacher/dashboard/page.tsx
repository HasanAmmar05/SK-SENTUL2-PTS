"use client";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { TeacherSidebar } from "@/components/teacher-sidebar";
import {
  getTeacherPayments,
  TeacherPayment,
  TeacherDashboardStats,
} from "@/app/teacher/actions";
import { Button } from "@/components/ui/button";
import AuthWrapper from "@/components/auth-wrapper";
import { Loader2, Filter, Search } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

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
    setDisplayLimit(Math.min(initialDisplayLimit, rolledPayments.length));
  }, [rolledPayments]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [classOptions, setClassOptions] = useState<string[]>([]);

  // Filter States
  const [filterSectionVisible, setFilterSectionVisible] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [minAmount, setMinAmount] = useState<number | "">("");
  const [maxAmount, setMaxAmount] = useState<number | "">("");
  const [rejectedChecked, setRejectedChecked] = useState(false);
  const [pendingChecked, setPendingChecked] = useState(false);
  const [approvedChecked, setApprovedChecked] = useState(false);
  const [studentNameSearch, setStudentNameSearch] = useState("");

  // Handle class query param from unified login
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const classParam = urlParams.get("class");
      if (classParam) {
        setSelectedClass(classParam);
      }
    }
  }, []);

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getTeacherPayments();
      setPayments(result.payments);
      // Calculate total approved paid per student
      const totalPaidMap = new Map<string, number>();
      for (const p of result.payments) {
        if (p.status === "Approved") {
          const key = `${p.studentName}|${p.className}`;
          totalPaidMap.set(key, (totalPaidMap.get(key) || 0) + p.amount);
        }
      }

      const map = new Map<string, TeacherPayment & { totalPaid: number }>();
      for (const p of result.payments) {
        const key = `${p.studentName}|${p.className}`;
        const existing = map.get(key);
        const precedence = (
          s: "Approved" | "Pending" | "Rejected" | "Unpaid"
        ) =>
          s === "Approved" ? 4 : s === "Pending" ? 3 : s === "Rejected" ? 2 : 1;
        if (!existing || precedence(p.status) > precedence(existing.status)) {
          const totalPaid = totalPaidMap.get(key) || 0;
          map.set(key, { ...p, totalPaid });
        }
      }
      setRolledPayments(Array.from(map.values()));

      // Use assignedClasses if available (from updated action), otherwise derive from payments
      const assignedClasses = (result as any).assignedClasses;
      let classes: string[] = [];

      if (Array.isArray(assignedClasses) && assignedClasses.length > 0) {
        classes = assignedClasses.sort();
      } else {
        classes = Array.from(
          new Set(Array.from(map.values()).map((p) => p.className))
        ).sort();
      }
      setClassOptions(classes);

      // Handle class selection with priority to URL param
      const urlParams = new URLSearchParams(window.location.search);
      const urlClass = urlParams.get("class");

      if (urlClass && classes.includes(urlClass)) {
        setSelectedClass(urlClass);
      } else if (classes.length > 0) {
        setSelectedClass((prev) => prev || classes[0]);
      }

      setStats(result.stats);
    } catch (err) {
      console.error("Failed to fetch teacher data:", err);
      setError("Failed to load payment data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFilters = () => {
    setFilterSectionVisible(!filterSectionVisible);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setPaymentStatus("");
    setMinAmount("");
    setMaxAmount("");
    setRejectedChecked(false);
    setPendingChecked(false);
    setApprovedChecked(false);
    setStudentNameSearch("");
    setSelectedClass(classOptions[0] || "");
  };

  const filteredPayments = useMemo(() => {
    return rolledPayments.filter((payment) => {
      // Class filter
      if (selectedClass && payment.className !== selectedClass) {
        return false;
      }

      // Date range filter
      let dateMatch = true;
      if (startDate || endDate) {
        if (!payment.dateOfPayment) {
          dateMatch = false;
        } else {
          const paymentDate = payment.dateOfPayment;
          dateMatch =
            (!startDate || paymentDate >= startDate) &&
            (!endDate || paymentDate <= endDate);
        }
      }

      // Status filter
      let statusMatch = true;
      if (paymentStatus) {
        statusMatch = payment.status === paymentStatus;
      } else {
        const activeFilters = [];
        if (rejectedChecked) activeFilters.push("Rejected");
        if (pendingChecked) activeFilters.push("Pending");
        if (approvedChecked) activeFilters.push("Approved");

        if (activeFilters.length > 0) {
          statusMatch = activeFilters.includes(payment.status);
        }
      }

      // Amount filter
      const amountMatch =
        (minAmount === "" || payment.amount >= (minAmount as number)) &&
        (maxAmount === "" || payment.amount <= (maxAmount as number));

      // Student name search
      const nameMatch = payment.studentName
        .toLowerCase()
        .includes(studentNameSearch.toLowerCase());

      return dateMatch && statusMatch && amountMatch && nameMatch;
    });
  }, [
    rolledPayments,
    selectedClass,
    startDate,
    endDate,
    paymentStatus,
    minAmount,
    maxAmount,
    rejectedChecked,
    pendingChecked,
    approvedChecked,
    studentNameSearch,
  ]);

  // Update display limit when filtered results change
  useEffect(() => {
    setDisplayLimit(Math.min(initialDisplayLimit, filteredPayments.length));
  }, [filteredPayments.length]);

  const getStatusColors = (
    status: "Approved" | "Pending" | "Rejected" | "Unpaid"
  ) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Unpaid":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const pieChartData = [
    {
      name: "Paid in Full",
      value: stats.fullPaymentsCount ?? 0,
      color: "#10b981",
    },
    {
      name: "Not Paid in Full",
      value: Math.max(stats.totalStudents - (stats.fullPaymentsCount ?? 0), 0),
      color: "#e2e8f0",
    },
  ];

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toISOString().split("T")[0];
    } catch {
      return iso;
    }
  };

  const escapeCSV = (val: any) => {
    const s = String(val ?? "");
    const needsQuotes = /[",\n]/.test(s);
    const escaped = s.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const downloadCSV = () => {
    const header = ["Student Name", "Class", "Status", "Amount", "Date"];
    const activeClass = selectedClass || classOptions[0] || "";
    const filtered = activeClass
      ? payments.filter((p) => p.className === activeClass)
      : payments;
    const rows = filtered.map((p) => [
      escapeCSV(p.studentName),
      escapeCSV(p.className),
      escapeCSV(p.status),
      escapeCSV(p.amount.toFixed(2)),
      escapeCSV(formatDate(p.dateOfPayment)),
    ]);
    const lines = [header.join(","), ...rows.map((r) => r.join(","))];
    lines.push("");
    lines.push(
      ["Total To Receive", String((stats.totalToReceive || 0).toFixed(2))].join(
        ","
      )
    );
    lines.push(
      [
        "Total Received",
        String((stats.totalPaymentsReceived || 0).toFixed(2)),
      ].join(",")
    );
    lines.push(
      [
        "Outstanding",
        String((stats.totalOutstandingPayments || 0).toFixed(2)),
      ].join(",")
    );
    lines.push(
      ["Partial Payments", String(stats.partialPaymentsCount || 0)].join(",")
    );
    lines.push(
      ["Full Payments", String(stats.fullPaymentsCount || 0)].join(",")
    );
    lines.push(["Total Students", String(stats.totalStudents || 0)].join(","));
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `teacher-class-report-${activeClass || "all"}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const title = `Teacher Class Report - ${new Date().toLocaleDateString()}`;
    const summary = `
      <div style="margin-bottom:16px;">
        <h2 style="margin:0 0 8px 0;">Summary</h2>
        <div>Total To Receive: MYR ${stats.totalToReceive.toFixed(2)}</div>
        <div>Total Received: MYR ${stats.totalPaymentsReceived.toFixed(2)}</div>
        <div>Outstanding: MYR ${stats.totalOutstandingPayments.toFixed(2)}</div>
        <div>Partial Payments: ${stats.partialPaymentsCount}</div>
        <div>Full Payments: ${stats.fullPaymentsCount}</div>
        <div>Students Paid in Full: ${stats.fullPaymentsCount}/${
      stats.totalStudents
    }</div>
      </div>
    `;
    const tableHeader = `
      <tr>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Student Name</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Class</th>
        <th style="text-align:center;padding:8px;border-bottom:1px solid #ddd;">Status</th>
        <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd;">Amount</th>
        <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd;">Date</th>
      </tr>
    `;
    const tableRows = payments
      .map(
        (p) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${escapeCSV(
          p.studentName
        )}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${escapeCSV(
          p.className
        )}</td>
        <td style="text-align:center;padding:8px;border-bottom:1px solid #f0f0f0;">${escapeCSV(
          p.status
        )}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid #f0f0f0;">MYR ${p.amount.toFixed(
          2
        )}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid #f0f0f0;">${formatDate(
          p.dateOfPayment
        )}</td>
      </tr>
    `
      )
      .join("");
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            h1 { margin: 0 0 16px 0; }
            table { width: 100%; border-collapse: collapse; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${summary}
          <table>
            <thead>${tableHeader}</thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const renderStudentPaymentStatus = () => {
    if (filteredPayments.length === 0) {
      return (
        <tr>
          <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
            No payment records found matching your filters.
          </td>
        </tr>
      );
    }

    const paymentsToDisplay = filteredPayments.slice(0, displayLimit);

    return paymentsToDisplay.map((student) => {
      const studentWithTotal = student as TeacherPayment & {
        totalPaid?: number;
      };
      const totalPaid = studentWithTotal.totalPaid || 0;
      const remainingAmount = Math.max((student.amountDue || 0) - totalPaid, 0);

      return (
        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--text-primary-teacher)]">
            {student.studentName}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-teacher)]">
            {student.className}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium text-left">
            RM{totalPaid.toFixed(2)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-600 font-medium text-left">
            RM{remainingAmount.toFixed(2)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-secondary-teacher)]">
            {student.dateOfPayment}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
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
          <div className="max-w-7xl mx-auto">
            <header className="mb-8">
              <h1 className="text-[var(--text-primary-teacher)] text-3xl font-bold leading-tight tracking-tight">
                Teacher Dashboard
              </h1>
              <p className="text-[var(--text-secondary-teacher)] text-base font-normal leading-normal">
                Overview of your class payment information
              </p>
            </header>
            <div className="flex items-center gap-4 mb-4">
              <Button
                onClick={toggleFilters}
                variant="outline"
                className="inline-flex items-center justify-center bg-white"
              >
                <Filter className="mr-2 w-4 h-4" />
                Filters
              </Button>
              <Button
                onClick={downloadCSV}
                disabled={!selectedClass && classOptions.length === 0}
              >
                Download CSV
              </Button>
              <Button variant="outline" onClick={downloadPDF}>
                Download PDF
              </Button>
            </div>

            {filterSectionVisible && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">
                      Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="date"
                        className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                      <input
                        type="date"
                        className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">
                      Payment Status
                    </label>
                    <select
                      className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-700">
                      Amount Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) =>
                          setMinAmount(
                            e.target.value === ""
                              ? ""
                              : Number.parseFloat(e.target.value)
                          )
                        }
                      />
                      <input
                        type="number"
                        className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) =>
                          setMaxAmount(
                            e.target.value === ""
                              ? ""
                              : Number.parseFloat(e.target.value)
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                  <Button onClick={resetFilters} variant="outline">
                    Reset
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 p-4 mb-8">
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-[var(--card-background-color-teacher)] shadow-lg border border-[var(--border-color-teacher)] transition-all hover:shadow-xl">
                <p className="text-[var(--text-secondary-teacher)] text-base font-medium leading-normal">
                  Total Amount to Receive
                </p>
                <p className="text-[var(--text-primary-teacher)] tracking-tight text-3xl font-bold leading-tight">
                  RM{stats.totalToReceive.toLocaleString()}
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
                  Total Amount Received
                </p>
                <p className="text-[var(--text-primary-teacher)] tracking-tight text-3xl font-bold leading-tight">
                  RM{stats.totalPaymentsReceived.toLocaleString()}
                </p>
                <div className="mt-1 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--primary-color-teacher)]"
                    style={{ width: "25%" }}
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
                  Partial Payments
                </p>
                <p className="text-[var(--text-primary-teacher)] tracking-tight text-3xl font-bold leading-tight">
                  {stats.partialPaymentsCount}
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl p-6 bg-[var(--card-background-color-teacher)] shadow-lg border border-[var(--border-color-teacher)] transition-all hover:shadow-xl">
                <p className="text-[var(--text-secondary-teacher)] text-base font-medium leading-normal">
                  Full Payments
                </p>
                <p className="text-[var(--text-primary-teacher)] tracking-tight text-3xl font-bold leading-tight">
                  {stats.fullPaymentsCount}
                </p>
              </div>

              <div className="flex flex-col gap-2 rounded-xl p-6 bg-[var(--card-background-color-teacher)] shadow-lg border border-[var(--border-color-teacher)] transition-all hover:shadow-xl">
                <p className="text-[var(--text-secondary-teacher)] text-base font-medium leading-normal mb-2">
                  Students Paid in Full
                </p>
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
                    <p className="text-[var(--text-primary-teacher)] text-2xl font-bold tracking-tight">
                      {stats.percentagePaidInFull.toFixed(1)}%
                    </p>
                    <p className="text-[var(--text-secondary-teacher)] text-xs">
                      {stats.fullPaymentsCount}/{stats.totalStudents} students
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h2 className="text-[var(--text-primary-teacher)] text-2xl font-semibold leading-tight tracking-tight mb-6">
                Student Payment Status
              </h2>

              {/* Search and Checkbox Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                  <h2 className="text-slate-900 text-xl font-semibold leading-tight">
                    Student Payment Overview
                  </h2>
                  <div className="flex items-center gap-2">
                    <Search className="text-slate-400 w-5 h-5" />
                    <input
                      className="block w-full sm:w-72 rounded-lg border-slate-300 bg-slate-50 py-2.5 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50"
                      placeholder="Search by Student Name"
                      type="search"
                      value={studentNameSearch}
                      onChange={(e) => setStudentNameSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                  <div className="relative w-full sm:w-auto">
                    <select
                      className="block w-full sm:w-48 rounded-lg border-slate-300 bg-slate-50 py-2.5 pr-10 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 focus:ring-opacity-50"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {classOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center text-sm text-slate-700">
                      <input
                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-opacity-50"
                        type="checkbox"
                        checked={rejectedChecked}
                        onChange={(e) => setRejectedChecked(e.target.checked)}
                      />
                      <span className="ml-2">Rejected</span>
                    </label>
                    <label className="flex items-center text-sm text-slate-700">
                      <input
                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-opacity-50"
                        type="checkbox"
                        checked={pendingChecked}
                        onChange={(e) => setPendingChecked(e.target.checked)}
                      />
                      <span className="ml-2">Pending</span>
                    </label>
                    <label className="flex items-center text-sm text-slate-700">
                      <input
                        className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-opacity-50"
                        type="checkbox"
                        checked={approvedChecked}
                        onChange={(e) => setApprovedChecked(e.target.checked)}
                      />
                      <span className="ml-2">Approved</span>
                    </label>
                  </div>
                </div>

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
                            Amount Remaining
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
                          Math.min(prev + 5, filteredPayments.length)
                        )
                      }
                      disabled={displayLimit >= filteredPayments.length}
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
          </div>
        </main>
      </div>
    </div>
  );
}
