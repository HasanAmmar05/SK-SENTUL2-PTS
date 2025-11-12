<<<<<<< HEAD
"use client"
import Link from "next/link"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"
import { Filter, Plus, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"

export default function TreasurerPendingPaymentsPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-[var(--background-light-treasurer-pending)]">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="treasurer" activePath="/treasurer/pending-payments" />
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
=======
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from "next/link";
import { TreasurerHeader } from "@/components/treasurer-header";
import { Filter, Plus, ArrowRight } from "lucide-react";

interface Payment {
  id: string;
  student_name: string;
  grade: string;
  amount: number;
  created_at: string;
  status: string;
}

export default function PendingPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('submitpayment')
        .select('id, student_name, grade, amount, created_at, status')
        .eq('status', 'Pending')
        .order('created_at', { ascending: false });

      if (error) console.error('Error fetching payments:', error.message);
      else setPayments(data || []);
      setLoading(false);
    };

    fetchPayments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <TreasurerHeader />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-bold text-gray-800">Pending Payments</h1>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md text-base hover:bg-gray-100 transition">
              <Filter size={18} /> Filter
            </button>
            <Link
              href="/payments/new"
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md text-base font-medium hover:bg-blue-700 transition"
            >
              <Plus size={18} /> New Payment
            </Link>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-500 text-lg py-6">Loading...</p>
        ) : payments.length === 0 ? (
          <p className="text-gray-500 text-lg py-6">No pending payments found.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-200 bg-white rounded-xl shadow-sm">
            <table className="min-w-full text-[15px] text-gray-900">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Student Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Class</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 border-t border-gray-100 transition"
                  >
                    <td className="px-6 py-4">{p.student_name}</td>
                    <td className="px-6 py-4">Grade {p.grade}</td>
                    <td className="px-6 py-4 font-medium">${p.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      {format(new Date(p.created_at), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        className={`${
                          p.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : 'bg-green-100 text-green-700 border border-green-200'
                        } text-sm font-medium px-3 py-1 rounded-full`}
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/treasurer/payment-details?id=${p.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                      >
                        View Details <ArrowRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
>>>>>>> 1154ffb2c22266ec59215616f3cd37d698bd5526
}
