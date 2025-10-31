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
  status: string; // “Pending” or “Completed”
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

  useEffect(() => {
    if (!userId) return;

    const fetchPayments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('submitpayment')
        .select('*')
        .eq('parent_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const currentYear = new Date().getFullYear();
      const grouped: Record<string, StudentData> = {};

      // Group payments by student
      data.forEach((row) => {
        const year = new Date(row.created_at).getFullYear();

        if (!grouped[row.student_name]) {
          grouped[row.student_name] = {
            student_name: row.student_name,
            grade: row.grade,
            payments: [],
            totalPaid: 0,
            remaining: 90, // Always start with MYR 90
          };
        }

        grouped[row.student_name].payments.push({
          id: row.id,
          amount: row.amount,
          created_at: row.created_at,
          proof_url: row.proof_url,
          status: 'Pending',
        });

        grouped[row.student_name].totalPaid += Number(row.amount);
      });

      // 🧮 Calculate year-to-year rollover
      Object.values(grouped).forEach((student) => {
        const lastYear = currentYear - 1;

        // 1️⃣ Get total paid last year
        const lastYearPayments = data.filter(
          (p) =>
            p.student_name === student.student_name &&
            new Date(p.created_at).getFullYear() === lastYear
        );
        const lastYearPaid = lastYearPayments.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );

        // 2️⃣ Tuition for last year
        const lastYearTuition = 90;
        const remainingFromLastYear = Math.max(lastYearTuition - lastYearPaid, 0);

        // 3️⃣ Get total paid this year
        const thisYearPayments = data.filter(
          (p) =>
            p.student_name === student.student_name &&
            new Date(p.created_at).getFullYear() === currentYear
        );
        const thisYearPaid = thisYearPayments.reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );

          // 4️⃣ Calculate total tuition for this year (with carry-over)
  let totalTuitionForThisYear =90;
    remainingFromLastYear > 0 ? 90 + remainingFromLastYear : 90;

  // 🧩 NEW FEATURE — If grade > 6, no payment required
  if (parseInt(student.grade) > 6) {
    totalTuitionForThisYear = 0;
}

// 5️⃣ Calculate remaining for this year
student.remaining = totalTuitionForThisYear - thisYearPaid;
student.totalPaid = thisYearPaid;

      });

      setStudents(Object.values(grouped));
      setLoading(false);
    };

    fetchPayments();
  }, [userId]);

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <>
      {/* 🟦 Navbar */}
      <MainHeader />

      {/* 🧾 Main Dashboard Content */}
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center">
        <div className="w-full max-w-5xl">
          <h1 className="text-xl font-bold mb-6 text-gray-800">My Children</h1>

          {students.length === 0 ? (
  <p className="text-center text-gray-500 italic mt-10">
    No payments made yet.
  </p>
) : (
  students.map((student, index) => (
    <Card
      key={index}
      className="mb-6 p-5 bg-white shadow-sm rounded-2xl border border-gray-200 hover:shadow-md transition-all"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-semibold text-gray-800">{student.student_name}</h2>
        <span className="text-sm text-gray-500">Grade {student.grade}</span>
      </div>

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
              <tr className="text-left text-gray-500">
                <th className="py-1">Date</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {student.payments.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-1">
                    {format(new Date(p.created_at), 'yyyy-MM-dd')}
                  </td>
                  <td>Tuition Payment</td>
                  <td>-MYR {p.amount.toFixed(2)}</td>
                  <td>
                    <Badge
                      className={
                        p.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }
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
    </>
  );
}
