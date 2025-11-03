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
}
