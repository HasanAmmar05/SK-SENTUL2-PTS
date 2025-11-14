'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { MainHeader } from '../../../components/MainHeader';
import { format } from 'date-fns';

interface Payment {
  id: string;
  amount: number;
  created_at: string;
  proof_url: string | null;
  status: string; // Pending | Approved | Rejected
}

interface StudentData {
  student_name: string;
  grade: string;
  payments: Payment[];
  totalPaid: number;
  remaining: number;
}

export default function ParentDashboard() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // 🟢 Fetch logged-in user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id ?? null);
    };
    fetchUser();
  }, []);

  // Fetch all payments (Pending, Approved, Rejected)
  useEffect(() => {
    if (!userId) return;

    const fetchAllPayments = async () => {
      setLoading(true);

      try {
        // 1️ Fetch from all 3 tables
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          supabase.from('submitpayment').select('*').eq('parent_id', userId),
          supabase.from('approved_payments').select('*').eq('parent_id', userId),
          supabase.from('rejected_payments').select('*').eq('parent_id', userId),
        ]);

        if (pendingRes.error) throw pendingRes.error;
        if (approvedRes.error) throw approvedRes.error;
        if (rejectedRes.error) throw rejectedRes.error;

        // 2️ Combine all payments into one array with status
        const allPayments = [
          ...(pendingRes.data || []).map((p) => ({ ...p, status: 'Pending' })),
          ...(approvedRes.data || []).map((p) => ({ ...p, status: 'Approved' })),
          ...(rejectedRes.data || []).map((p) => ({ ...p, status: 'Rejected' })),
        ];

        // 3️ Group by student
        const grouped: Record<string, StudentData> = {};

        allPayments.forEach((row) => {
          if (!grouped[row.student_name]) {
            grouped[row.student_name] = {
              student_name: row.student_name,
              grade: row.grade,
              payments: [],
              totalPaid: 0,
              remaining: 0,
            };
          }

          grouped[row.student_name].payments.push({
            id: row.id,
            amount: row.amount,
            created_at: row.created_at,
            proof_url: row.proof_url,
            status: row.status,
          });

          // Only count approved payments
          if (row.status === 'Approved') {
            grouped[row.student_name].totalPaid += Number(row.amount);
          }
        });

      // 4️ Apply sibling rule — first = 90, others = 50, with January yearly increment and carry-over logic
const allStudents = Object.values(grouped);
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth(); // 0 = January
const isAfterJanuary = currentMonth >= 0; // always true, but we’ll use month check for yearly logic

// Determine how many years have passed since start (e.g., 2025 baseline)
const BASE_YEAR = 2025;
const yearDiff = currentYear - BASE_YEAR;

// Base tuition per sibling position
allStudents.forEach((student, index) => {
  //  Base amount for this student
  let baseFee = index === 0 ? 90 : 50;

  //  Yearly increment (every January increases the fee)
  let yearlyFee = baseFee + yearDiff * baseFee; // e.g., 2026 → +90 or +50

  // Skip if grade > 6
  if (parseInt(student.grade) > 6) yearlyFee = 0;

  //  Calculate total paid so far
  const totalPaid = student.totalPaid;
  let remaining = yearlyFee - totalPaid;

  //  Handle carry-over after January
  // If unpaid balance remains from previous year → add it to this year's fee
  if (remaining > 0 && currentMonth === 0) {
    remaining = yearlyFee + remaining; // add unpaid
  }

  // 🔹 If overpaid → subtract extra
  if (remaining < 0 && currentMonth === 0) {
    remaining = yearlyFee + remaining; // subtract overpayment
  }

  student.remaining = Math.max(remaining, 0);
});


        setStudents(allStudents);
      } catch (err) {
        console.error('Error fetching payments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllPayments();
  }, [userId]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <>
      <MainHeader />

      <div className="min-h-screen bg-gray-100 py-8 px-4 flex justify-center">
        <div className="w-full max-w-6xl">
          <div className="bg-white p-6 rounded-3xl shadow-md mb-6">
            <h1 className="text-3xl font-bold mb-0 text-gray-800">My Children</h1>
          </div>

          <div className="space-y-6">
            {students.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl shadow-sm text-center text-gray-500 italic">
                No payments made yet.
              </div>
            ) : (
              students.map((student, index) => (
                <Card
                  key={index}
                  className="mb-6 p-6 bg-white shadow-sm rounded-3xl hover:shadow-md transition-all"
                >
                  {/* Student Info */}
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-gray-800">
                      {student.student_name}
                    </h2>
                    <span className="text-sm text-gray-500">
                      Grade {student.grade}
                    </span>
                  </div>

                  {/* Fees Info */}
                  <div className="flex justify-between mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Remaining Tuition Fees</p>
                      <p className="text-base font-semibold text-red-600">
                        MYR {student.remaining.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Paid So Far</p>
                      <p className="text-base font-semibold text-green-600">
                        MYR {student.totalPaid.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <h3 className="font-medium text-gray-700 text-sm mb-1">
                    Transaction History
                  </h3>

                  <div className="overflow-x-auto">
                    {student.payments.length === 0 ? (
                      <p className="text-center italic text-gray-500 py-3">
                        No payments made yet.
                      </p>
                    ) : (
                      <table className="w-full text-xs border-t border-gray-200">
                        <thead>
                          <tr className="text-left text-gray-600 bg-gray-100">
                            <th className="py-2 px-2">Date</th>
                            <th className="px-2">Description</th>
                            <th className="px-2">Amount</th>
                            <th className="px-2">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {student.payments
                            .sort(
                              (a, b) =>
                                new Date(b.created_at).getTime() -
                                new Date(a.created_at).getTime()
                            )
                            .map((p, idx) => (
                              <tr
                                key={p.id}
                                className={`border-t border-gray-100 ${
                                  idx % 2 === 1 ? 'bg-gray-50' : ''
                                }`}
                              >
                                <td className="py-2 px-2">
                                  {format(new Date(p.created_at), 'yyyy-MM-dd')}
                                </td>
                                <td className="px-2">Tuition Payment</td>
                                <td className="px-2">-MYR {p.amount.toFixed(2)}</td>
                                <td className="px-2">
                                  <Badge
                                    className={`rounded-full px-3 py-1 ${
                                      p.status === 'Approved'
                                        ? 'bg-green-100 text-green-700'
                                        : p.status === 'Rejected'
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {p.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
