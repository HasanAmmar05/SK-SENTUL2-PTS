'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { TreasurerHeader } from '@/components/treasurer-header';

interface PaymentDetail {
  id: string;
  parent_id: string;
  student_name: string;
  grade: string;
  amount: number;
  proof_url: string | null;
  created_at: string;
  status: string;
}

interface ParentProfile {
  full_name: string;
  email: string;
  phone: string | null;
}

export default function PaymentDetailsPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [parent, setParent] = useState<ParentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const { data: paymentData, error: paymentError } = await supabase
          .from('submitpayment')
          .select('*')
          .eq('id', id)
          .single();

        if (paymentError || !paymentData) throw paymentError;
        setPayment(paymentData);

        if (paymentData.parent_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', paymentData.parent_id)
            .single();

          if (profileError) throw profileError;
          setParent(profileData);
        }
      } catch (err) {
        console.error('Error fetching payment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleAction = async (newStatus: 'Approved' | 'Rejected') => {
    if (!payment) return;
    const { error } = await supabase
      .from('submitpayment')
      .update({ status: newStatus })
      .eq('id', payment.id);

    if (error) {
      alert('Failed to update status.');
    } else {
      alert(`Payment ${newStatus}!`);
      setPayment({ ...payment, status: newStatus });
    }
  };

  if (!id)
    return <div className="p-8 text-red-600">Invalid or missing payment ID.</div>;
  if (loading) return <p className="p-8">Loading payment details...</p>;
  if (!payment)
    return <p className="p-8 text-red-600">Payment not found for ID: {id}</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <TreasurerHeader />

      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        {/* Header Section */}
        <div className="border rounded-lg bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold text-gray-800">
              Pending Payment Details
            </h1>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              📅 Date Submitted:{' '}
              {payment.created_at
                ? format(new Date(payment.created_at), 'MMM dd, yyyy')
                : '-'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Review and approve or reject the payment details submitted by the parent.
          </p>
        </div>

        {/* Parent Information */}
        <div className="border rounded-lg bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
            🧑‍💼 Parent Information
          </h2>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="font-semibold text-gray-700 mb-1">Parent Name</p>
              <p>{parent?.full_name || 'N/A'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">Contact Information</p>
              <p>{parent?.email || 'N/A'}</p>
              {parent?.phone && <p>{parent.phone}</p>}
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border rounded-lg bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
            💳 Payment Details
          </h2>

          <table className="w-full text-left border-t">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Child’s Name</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Grade</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Payment Proof</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-3 px-4">{payment.student_name}</td>
                <td className="py-3 px-4">{payment.grade}</td>
                <td className="py-3 px-4 text-green-600 font-semibold">
                  ${payment.amount.toFixed(2)}
                </td>
                <td className="py-3 px-4">
                  {payment.proof_url ? (
                    <a
                      href={payment.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Receipt
                    </a>
                  ) : (
                    <span className="text-gray-500">No proof uploaded</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="border rounded-lg bg-white shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 border-b pb-2">
            ✅ Actions
          </h2>
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => handleAction('Rejected')}
              className="bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              ✕ Reject
            </Button>
            <Button
              onClick={() => handleAction('Approved')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              ✓ Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
