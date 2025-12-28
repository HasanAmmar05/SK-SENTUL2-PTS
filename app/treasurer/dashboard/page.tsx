"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MainHeader } from "@/components/main-header";
import { supabase } from "@/lib/supabase-client";
import AuthWrapper from "@/components/auth-wrapper";
import {
  Filter,
  DollarSign,
  ArrowDown,
  Clock,
  CheckCircle,
  Search,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface Payment {
  id: string;
  student_name: string;
  grade: string;
  amount: number;
  created_at: string;
  status: "Pending" | "Approved" | "Rejected";
  parent_id: string;
}

interface Profile {
  id: string;
  full_name: string;
}

export default function TreasurerDashboardPage() {
  return (
    <AuthWrapper>
      <TreasurerDashboardContent />
    </AuthWrapper>
  );
}

function TreasurerDashboardContent() {
  const [filterSectionVisible, setFilterSectionVisible] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [minAmount, setMinAmount] = useState<number | "">("");
  const [maxAmount, setMaxAmount] = useState<number | "">("");
  const [rejectedChecked, setRejectedChecked] = useState(false);
  const [partiallyPaidChecked, setPartiallyPaidChecked] = useState(false);
  const [completelyPaidChecked, setCompletelyPaidChecked] = useState(false);
  const [parentNameSearch, setParentNameSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");

  const [payments, setPayments] = useState<Payment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [globalTotals, setGlobalTotals] = useState<{
    year: number;
    to_receive: number;
    received: number;
    outstanding: number;
  } | null>(null);
  const [feesMap, setFeesMap] = useState<Map<string, number>>(new Map());
  const [feesMapById, setFeesMapById] = useState<Map<string, number>>(
    new Map()
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Fetch all tables
      const { data: pendingData } = await supabase
        .from("submitpayment")
        .select("*");

      const { data: approvedData } = await supabase
        .from("approved_payments")
        .select("*");

      const { data: rejectedData } = await supabase
        .from("rejected_payments")
        .select("*");

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, full_name");

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

      setPayments(allPayments);
      setProfiles(profilesData ?? []);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchGlobalTotals = async () => {
      const year = new Date().getFullYear();
      const { data, error } = await supabase
        .from("v_totals_global")
        .select("year, to_receive, received, outstanding")
        .eq("year", year)
        .limit(1);
      if (!error && data && data.length > 0) {
        setGlobalTotals({
          year: data[0].year,
          to_receive: Number(data[0].to_receive || 0),
          received: Number(data[0].received || 0),
          outstanding: Number(data[0].outstanding || 0),
        });
      }
    };
    fetchGlobalTotals();
  }, []);

  useEffect(() => {
    const fetchFeesAssignments = async () => {
      // Fetch fees assignments and join with parent_students to get student name and ID
      const { data } = await supabase
        .from("fees_assignments")
        .select(
          "student_id, amount_due, grade, parent_students!fees_assignments_student_id_fkey(id, student_name, student_grade)"
        )
        .eq("status", "Active");

      const map = new Map<string, number>();
      const mapById = new Map<string, number>();

      if (!data) return;

      console.log("Fees Assignments Raw:", data); // Debug log

      data.forEach((r: any) => {
        // Map by Student ID (Most accurate)
        if (r.student_id) {
          const current = mapById.get(r.student_id) || 0;
          mapById.set(r.student_id, current + (Number(r.amount_due) || 0));
        }

        // We have two strategies to match:
        // 1. By student name + grade (for older payments)
        // 2. By exact student_id (if payments had it, but they don't seem to)
        // So we focus on robust name matching.

        const studentName = r.parent_students?.student_name;
        if (studentName) {
          const normalizedName = studentName.toLowerCase().trim();
          const normalizedGrade = r.grade; // e.g., "1 Merbau"

          // Key 1: Full Name + Full Grade
          const key1 = `${normalizedName}|${normalizedGrade}`;
          map.set(key1, (map.get(key1) || 0) + (Number(r.amount_due) || 0));

          // Key 2: Full Name + Short Grade (e.g., "1")
          const gradeParts = normalizedGrade.split(" ");
          if (gradeParts.length > 0) {
            const shortGrade = gradeParts[0]; // "1"
            const key2 = `${normalizedName}|${shortGrade}`;
            // Only set if not already present (prefer full grade)
            if (!map.has(key2)) {
              map.set(key2, (map.get(key2) || 0) + (Number(r.amount_due) || 0));
            }
          }

          // Key 3: Full Name + "Grade X Merbau" (Handle "Grade 2 Merbau" vs "2 Merbau")
          // If payment says "Grade 2 Merbau" and fees says "2 Merbau"
          const gradeWithPrefix = `grade ${normalizedGrade.toLowerCase()}`;
          const key3 = `${normalizedName}|${gradeWithPrefix}`;
          // e.g., "muntasir|grade 2 merbau"
          if (!map.has(key3)) {
            map.set(key3, (map.get(key3) || 0) + (Number(r.amount_due) || 0));
          }

          // Key 4: Name Only (Last Resort - if unique enough)
          // This is dangerous if two students have same name, but good fallback
          // We'll prefix with "NAME_ONLY:" to distinguish
          const key4 = `NAME_ONLY:${normalizedName}`;
          // If multiple students have same name, we might overwrite, which is a risk
          // But usually better than showing 0.00
          if (!map.has(key4)) {
            map.set(key4, (map.get(key4) || 0) + (Number(r.amount_due) || 0));
          }

          // DEBUG: Log keys being set
          // console.log(`Set Fees Key: [${key1}] = ${r.amount_due}`);
        }
      });

      setFeesMap(map);
      setFeesMapById(mapById);
    };
    fetchFeesAssignments();
  }, []);

  const getParentName = (parentId: string): string => {
    const profile = profiles.find((p) => p.id === parentId);
    return profile ? profile.full_name : "Unknown";
  };

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // Date range filter
      const paymentDate = new Date(payment.created_at)
        .toISOString()
        .split("T")[0];
      const dateMatch =
        (!startDate || paymentDate >= startDate) &&
        (!endDate || paymentDate <= endDate);

      // Status filter
      let statusMatch = true;
      if (paymentStatus) {
        // Map payment status to filter status
        const statusMap: { [key: string]: string } = {
          Approved: "full",
          Pending: "partial",
          Rejected: "rejected",
        };
        statusMatch = statusMap[payment.status] === paymentStatus;
      } else {
        const activeFilters = [];
        if (rejectedChecked) activeFilters.push("Rejected");
        if (partiallyPaidChecked) activeFilters.push("Pending");
        if (completelyPaidChecked) activeFilters.push("Approved");

        if (activeFilters.length > 0) {
          statusMatch = activeFilters.includes(payment.status);
        }
      }

      // Grade/Class filter
      let classGradeMatch = true;
      if (classFilter) {
        classGradeMatch = `Grade ${payment.grade}` === classFilter;
      } else if (gradeLevel) {
        classGradeMatch = payment.grade === gradeLevel;
      }

      // Amount filter
      const amountMatch =
        (minAmount === "" || payment.amount >= (minAmount as number)) &&
        (maxAmount === "" || payment.amount <= (maxAmount as number));

      // Parent name search
      const parentName = getParentName(payment.parent_id);
      const parentNameMatch = parentName
        .toLowerCase()
        .includes(parentNameSearch.toLowerCase());

      return (
        dateMatch &&
        statusMatch &&
        classGradeMatch &&
        amountMatch &&
        parentNameMatch
      );
    });
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
  ]);

  const approvedByStudent = useMemo(() => {
    const map = new Map<string, number>();
    filteredPayments
      .filter((p) => p.status === "Approved")
      .forEach((p) => {
        const k = `${p.student_name}|${p.grade}`;
        map.set(k, (map.get(k) || 0) + (Number(p.amount) || 0));
      });
    return map;
  }, [filteredPayments]);

  const stats = useMemo(() => {
    const totalReceived = filteredPayments
      .filter((p) => p.status === "Approved")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalToReceive = globalTotals
      ? globalTotals.to_receive
      : filteredPayments.reduce((sum, p) => sum + p.amount, 0);

    // Group approved payments by student Name+Grade (or ID if we had it easily)
    // We'll iterate through all unique students we know about (from fees + payments)

    // 1. Collect all students involved
    const allStudentKeys = new Set<string>();

    // From fees
    Array.from(feesMap.keys()).forEach((k) => {
      if (!k.startsWith("NAME_ONLY:")) allStudentKeys.add(k);
    });

    // From payments
    filteredPayments.forEach((p) => {
      allStudentKeys.add(`${p.student_name.toLowerCase().trim()}|${p.grade}`);
    });

    let fullPaymentsCount = 0;
    let partialPaymentsCount = 0;

    // We need to group by unique student entity, not just keys
    // The keys in allStudentKeys might overlap (e.g. "ali|1" and "ali|1 merbau")
    // This is tricky. Let's try to aggregate by Name first.

    const studentStats = new Map<string, { due: number; paid: number }>();

    // Helper to get canonical name
    const getCanonical = (name: string, grade: string) => {
      return `${name.toLowerCase().trim()}|${grade.toLowerCase().trim()}`;
    };

    // 1. Sum up Dues per Student (using feesMapById if possible, else robust matching)
    // Actually, feesMapById is the most reliable source for Total Due per student.
    // But we need to link it to the payments.
    // Payments don't have student_id easily accessible here without joining parent_students again.
    // But we have parent_students data in fees fetch.

    // Let's rely on robust string matching like we did in Teacher Dashboard.

    // Iterate unique students found in filteredPayments (these are the ones we are reporting on)
    // OR should we include students who haven't paid anything?
    // The dashboard usually shows stats for the filtered set.

    const uniqueStudents = new Set<string>();
    filteredPayments.forEach((p) =>
      uniqueStudents.add(`${p.student_name}|${p.grade}`)
    );

    // Also include students from feesMap who might not have paid yet (if filters allow?)
    // If filters are active (e.g. grade level), we should probably include unpaid students too?
    // But filteredPayments is already filtered.
    // If "Pending" filter is on, we only see pending.

    // Let's stick to calculating stats based on the "filteredPayments" view + corresponding fees.

    uniqueStudents.forEach((studentKey) => {
      const [name, grade] = studentKey.split("|");
      const normalizedName = name.toLowerCase().trim();

      // Calculate Total Paid for this student (from filtered list or global list?)
      // "Students Paid in Full" usually implies global status, not just filtered status.
      // But the table shows filtered rows.
      // Teacher dashboard logic: Compare Total Lifetime Paid vs Total Lifetime Due.
      // Here filteredPayments respects date range.
      // If I filter by "Last Month", "Paid in Full" might be misleading if I only paid half last month.
      // Usually "Paid in Full" status refers to the student's overall standing.

      // However, if the user filters by date, they might want to see who paid in full *within that period*?
      // Unlikely. "Paid in Full" is a status.
      // Let's assume we want to know if the student has zero outstanding balance.

      // We need ALL approved payments for these students to determine if they are paid in full.
      // filteredPayments might be a subset.
      // We have `payments` state which has ALL payments (unfiltered).

      const allStudentPayments = payments.filter(
        (p) =>
          p.status === "Approved" &&
          p.student_name.toLowerCase().trim() === normalizedName
        // We should also check grade, but loosely
      );

      const totalPaid = allStudentPayments.reduce((sum, p) => {
        const rowGrade = p.grade;
        // Robust Grade Match
        let isMatch = false;
        if (rowGrade === grade) isMatch = true;
        else if (grade.includes(rowGrade) || rowGrade.includes(grade))
          isMatch = true;
        else if (rowGrade.split(" ")[0] === grade.split(" ")[0]) isMatch = true;

        return isMatch ? sum + p.amount : sum;
      }, 0);

      // Calculate Total Due
      // Try exact match first
      const normalizedKey = `${normalizedName}|${grade}`;
      let due = feesMap.get(normalizedKey) || 0;

      // Try other keys
      if (!due) due = feesMap.get(normalizedKey.toLowerCase());
      if (!due && grade.toLowerCase().startsWith("grade ")) {
        const stripped = grade.toLowerCase().replace("grade ", "").trim();
        due = feesMap.get(`${normalizedName}|${stripped}`) || 0;
      }
      if (!due) due = feesMap.get(`NAME_ONLY:${normalizedName}`) || 0;

      if (due > 0) {
        if (totalPaid >= due - 0.01) fullPaymentsCount++;
        else if (totalPaid > 0) partialPaymentsCount++;
      }
    });

    const totalStudents = uniqueStudents.size;
    const studentsPaidInFull = fullPaymentsCount;
    const percentagePaidInFull =
      totalStudents > 0 ? (studentsPaidInFull / totalStudents) * 100 : 0;

    return {
      totalToReceive,
      totalReceived: globalTotals ? globalTotals.received : totalReceived,
      partialPaymentsCount,
      fullPaymentsCount,
      totalStudents,
      studentsPaidInFull,
      percentagePaidInFull,
    };
  }, [filteredPayments, globalTotals, feesMap, payments]);

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
    const header = [
      "Student Name",
      "Class",
      "Parent Name",
      "Status",
      "Amount",
      "Date",
    ];
    const rows = filteredPayments.map((p) => [
      escapeCSV(p.student_name),
      escapeCSV(p.grade),
      escapeCSV(getParentName(p.parent_id)),
      escapeCSV(p.status),
      escapeCSV(p.amount.toFixed(2)),
      escapeCSV(formatDate(p.created_at)),
    ]);
    const lines = [header.join(","), ...rows.map((r) => r.join(","))];
    lines.push("");
    const outstanding = globalTotals
      ? globalTotals.outstanding
      : Math.max(stats.totalToReceive - stats.totalReceived, 0);
    lines.push(
      [
        "Total To Receive",
        String(
          globalTotals
            ? globalTotals.to_receive.toFixed(2)
            : stats.totalToReceive.toFixed(2)
        ),
      ].join(",")
    );
    lines.push(
      [
        "Total Received",
        String(
          globalTotals
            ? globalTotals.received.toFixed(2)
            : stats.totalReceived.toFixed(2)
        ),
      ].join(",")
    );
    lines.push(["Outstanding", String(outstanding.toFixed(2))].join(","));
    lines.push(
      [
        "Students Paid",
        `${stats.studentsPaidInFull}/${stats.totalStudents}`,
      ].join(",")
    );
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `treasurer-report-${
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
    const title = `Treasurer Report - ${new Date().toLocaleDateString()}`;
    const outstanding = globalTotals
      ? globalTotals.outstanding
      : Math.max(stats.totalToReceive - stats.totalReceived, 0);
    const summary = `
      <div style="margin-bottom:16px;">
        <h2 style="margin:0 0 8px 0;">Summary</h2>
        <div>Total To Receive: MYR ${(globalTotals
          ? globalTotals.to_receive
          : stats.totalToReceive
        ).toFixed(2)}</div>
        <div>Total Received: MYR ${(globalTotals
          ? globalTotals.received
          : stats.totalReceived
        ).toFixed(2)}</div>
        <div>Outstanding: MYR ${outstanding.toFixed(2)}</div>
        <div>Students Paid: ${stats.studentsPaidInFull}/${
      stats.totalStudents
    }</div>
      </div>
    `;
    const tableHeader = `
      <tr>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Student Name</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Class</th>
        <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Parent Name</th>
        <th style="text-align:center;padding:8px;border-bottom:1px solid #ddd;">Status</th>
        <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd;">Amount</th>
        <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd;">Date</th>
      </tr>
    `;
    const tableRows = filteredPayments
      .map(
        (p) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${escapeCSV(
          p.student_name
        )}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${escapeCSV(
          p.grade
        )}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;">${escapeCSV(
          getParentName(p.parent_id)
        )}</td>
        <td style="text-align:center;padding:8px;border-bottom:1px solid #f0f0f0;">${escapeCSV(
          p.status
        )}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid #f0f0f0;">MYR ${p.amount.toFixed(
          2
        )}</td>
        <td style="text-align:right;padding:8px;border-bottom:1px solid #f0f0f0;">${formatDate(
          p.created_at
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

  const toggleFilters = () => {
    setFilterSectionVisible(!filterSectionVisible);
  };

  const resetFilters = () => {
    setStartDate("");
    setEndDate("");
    setPaymentStatus("");
    setGradeLevel("");
    setMinAmount("");
    setMaxAmount("");
    setRejectedChecked(false);
    setPartiallyPaidChecked(false);
    setCompletelyPaidChecked(false);
    setParentNameSearch("");
    setClassFilter("");
  };

  const renderPaymentOverview = () => {
    const itemsToShow = showAll
      ? filteredPayments
      : filteredPayments.slice(0, 5);
    return itemsToShow.map((p) => (
      <tr key={p.id} className="hover:bg-slate-50">
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
          {p.student_name}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
          Grade {p.grade}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
          {getParentName(p.parent_id)}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
          <span className={`status-pill status-${p.status.toLowerCase()}`}>
            {p.status}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-red-600 text-right">
          {(() => {
            const normalizedName = p.student_name.toLowerCase().trim();
            const normalizedKey = `${normalizedName}|${p.grade}`;
            const normalizedKeyWithGradePrefix = `${normalizedName}|grade ${p.grade
              .toLowerCase()
              .trim()}`;
            // If p.grade already has "Grade " prefix, we try to strip it too?
            // Actually, p.grade in screenshot is "Grade 2 Merbau"
            // So we need to match it against "2 Merbau" in feesMap

            // Try 1: Exact match "muntasir|Grade 2 Merbau" (unlikely to exist in feesMap if fees use "2 Merbau")
            let due = feesMap.get(normalizedKey) || 0;

            // Try 2: Lowercase match "muntasir|grade 2 merbau"
            if (!due) due = feesMap.get(normalizedKey.toLowerCase());

            // Try 3: Strip "Grade " prefix if present
            if (!due && p.grade.toLowerCase().startsWith("grade ")) {
              const strippedGrade = p.grade
                .toLowerCase()
                .replace("grade ", "")
                .trim(); // "2 merbau"
              const keyStripped = `${normalizedName}|${strippedGrade}`;
              due = feesMap.get(keyStripped) || 0;
            }

            // Try 4: Name Only Fallback
            if (!due) due = feesMap.get(`NAME_ONLY:${normalizedName}`) || 0;

            return `MYR ${due.toFixed(2)}`;
          })()}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-green-600 text-right">
          {`MYR ${p.amount.toFixed(2)}`}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-amber-500 text-right">
          {(() => {
            const key = `${p.student_name}|${p.grade}`;

            // Re-calculate due (same logic as above)
            const normalizedName = p.student_name.toLowerCase().trim();
            const normalizedKey = `${normalizedName}|${p.grade}`;
            let due = feesMap.get(normalizedKey) || 0;
            if (!due) due = feesMap.get(normalizedKey.toLowerCase());
            if (!due && p.grade.toLowerCase().startsWith("grade ")) {
              const strippedGrade = p.grade
                .toLowerCase()
                .replace("grade ", "")
                .trim();
              const keyStripped = `${normalizedName}|${strippedGrade}`;
              due = feesMap.get(keyStripped) || 0;
            }
            if (!due) due = feesMap.get(`NAME_ONLY:${normalizedName}`) || 0;

            const paidApproved = approvedByStudent.get(key) || 0;
            const remaining = Math.max(due - paidApproved, 0);
            return `MYR ${remaining.toFixed(2)}`;
          })()}
        </td>
      </tr>
    ));
  };

  const renderRecentPayments = () => {
    const sortedData = [...filteredPayments].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const itemsToShow = sortedData.slice(0, 6);

    return itemsToShow.map((p) => (
      <tr key={p.id} className="hover:bg-slate-50">
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
          {p.student_name}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-red-600 text-right">
          MYR {p.amount.toFixed(2)}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500">
          {new Date(p.created_at).toLocaleDateString()}
        </td>
        <td className="whitespace-nowrap px-4 py-4 text-sm text-center">
          <span className={`status-pill status-${p.status.toLowerCase()}`}>
            {p.status}
          </span>
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
    ));
  };

  const pieChartData = [
    { name: "Paid in Full", value: stats.studentsPaidInFull, color: "#10b981" },
    {
      name: "Not Paid in Full",
      value: stats.totalStudents - stats.studentsPaidInFull,
      color: "#e2e8f0",
    },
  ];

  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-slate-100">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="treasurer" activePath="/treasurer/dashboard" />
        <main className="px-6 md:px-10 lg:px-16 xl:px-24 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <h1 className="text-slate-900 text-3xl font-bold leading-tight">
                Treasurer Dashboard
              </h1>
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
                <button
                  onClick={downloadCSV}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-offset-2"
                >
                  Download CSV
                </button>
                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-offset-2"
                >
                  Download PDF
                </button>
              </div>
            </div>

            {filterSectionVisible && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="startDate"
                    >
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
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="paymentStatus"
                    >
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
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="gradeLevel"
                    >
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
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="minAmount"
                    >
                      Amount Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        className="rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)]"
                        id="minAmount"
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
                        className="rounded-lg border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-[var(--primary-color-treasurer-dashboard)] focus:ring-[var(--primary-color-treasurer-dashboard)]"
                        id="maxAmount"
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
                  <p className="text-slate-600 text-sm font-medium">
                    Total Amount to Receive
                  </p>
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
                  <p className="text-slate-600 text-sm font-medium">
                    Total Amount Received
                  </p>
                  <span className="text-green-500">
                    <ArrowDown className="w-5 h-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">
                  MYR {stats.totalReceived.toFixed(2)}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">
                    Partial Payments
                  </p>
                  <span className="text-amber-500">
                    <Clock className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">
                  {stats.partialPaymentsCount}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 text-sm font-medium">
                    Full Payments
                  </p>
                  <span className="text-green-500">
                    <CheckCircle className="h-5 w-5" />
                  </span>
                </div>
                <p className="text-slate-900 text-3xl font-bold tracking-tight">
                  {stats.fullPaymentsCount}
                </p>
              </div>
              <div className="flex flex-col gap-2 rounded-xl p-6 bg-white shadow-sm border border-slate-200">
                <p className="text-slate-600 text-sm font-medium mb-2">
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
                <h2 className="text-slate-900 text-xl font-semibold leading-tight">
                  Student Payment Overview
                </h2>
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
                      onChange={(e) =>
                        setPartiallyPaidChecked(e.target.checked)
                      }
                    />
                    <span className="ml-2">Partially Paid</span>
                  </label>
                  <label className="flex items-center text-sm text-slate-700">
                    <input
                      className="h-4 w-4 text-[var(--primary-color-treasurer-dashboard)] border-slate-300 rounded focus:ring-[var(--primary-color-treasurer-dashboard)] focus:ring-opacity-50"
                      type="checkbox"
                      checked={completelyPaidChecked}
                      onChange={(e) =>
                        setCompletelyPaidChecked(e.target.checked)
                      }
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
              <h2 className="text-slate-900 text-xl font-semibold leading-tight mb-6">
                Recent Payments
              </h2>
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
  );
}
