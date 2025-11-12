<<<<<<< HEAD
"use client"
import Image from "next/image"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"
import { Calendar, User, ReceiptText, X, Check } from "lucide-react"

export default function TreasurerPaymentDetailsPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-[var(--background-color-treasurer-details)]">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="treasurer" activePath="/treasurer/payment-details" />
        <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col max-w-5xl flex-1 gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-[var(--border-color-treasurer-details)]">
              <div>
                <h2 className="text-[var(--text-primary-treasurer-details)] text-2xl font-semibold leading-tight">
                  Pending Payment Details
                </h2>
                <p className="text-[var(--text-secondary-treasurer-details)] text-sm font-normal leading-normal mt-1">
                  Review and approve or reject the payment details submitted by the parent.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary-treasurer-details)]">
                <Calendar className="w-4 h-4" />
                <span>Date Submitted: Oct 26, 2023</span>
              </div>
            </div>
            <section className="bg-white rounded-lg shadow-sm border border-[var(--border-color-treasurer-details)] p-6">
              <h3 className="text-[var(--text-primary-treasurer-details)] text-xl font-semibold leading-tight tracking-tight mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-[var(--primary-color-treasurer-details)]" />
                Parent Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="border-t border-[var(--border-color-treasurer-details)] pt-4">
                  <p className="text-[var(--text-secondary-treasurer-details)] text-xs font-medium leading-normal">
                    Parent Name
                  </p>
                  <p className="text-[var(--text-primary-treasurer-details)] text-base font-medium leading-normal mt-1">
                    Sophia Clark
                  </p>
                </div>
                <div className="border-t border-[var(--border-color-treasurer-details)] pt-4">
                  <p className="text-[var(--text-secondary-treasurer-details)] text-xs font-medium leading-normal">
                    Contact Information
                  </p>
                  <p className="text-[var(--text-primary-treasurer-details)] text-base font-medium leading-normal mt-1">
                    sophia.clark@email.com
                  </p>
                </div>
              </div>
            </section>
            <section className="bg-white rounded-lg shadow-sm border border-[var(--border-color-treasurer-details)] p-6">
              <h3 className="text-[var(--text-primary-treasurer-details)] text-xl font-semibold leading-tight tracking-tight mb-4 flex items-center gap-2">
                <ReceiptText className="w-6 h-6 text-[var(--primary-color-treasurer-details)]" />
                Payment Details
              </h3>
              <div className="overflow-x-auto @container">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--border-color-treasurer-details)]">
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Child's Name
                      </th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Paid Amount
                      </th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Remaining Amount
                      </th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Current Payment
                      </th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Payment Proof
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color-treasurer-details)]">
                    <tr>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-primary-treasurer-details)] text-sm font-medium">
                        Liam Clark
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary-treasurer-details)] text-sm">
                        $250.00
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary-treasurer-details)] text-sm">
                        $0.00
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-green-600 text-sm font-semibold">$250.00</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Image
                          alt="Payment Proof for Liam Clark"
                          className="payment-proof-thumbnail"
                          src="/images/payment-proof-liam.png"
                          width={40}
                          height={40}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-primary-treasurer-details)] text-sm font-medium">
                        Olivia Clark
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary-treasurer-details)] text-sm">
                        $250.00
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary-treasurer-details)] text-sm">
                        $0.00
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-green-600 text-sm font-semibold">$250.00</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Image
                          alt="Payment Proof for Olivia Clark"
                          className="payment-proof-thumbnail"
                          src="/images/payment-proof-olivia.png"
                          width={40}
                          height={40}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section className="bg-white rounded-lg shadow-sm border border-[var(--border-color-treasurer-details)] p-6">
              <h3 className="text-[var(--text-primary-treasurer-details)] text-xl font-semibold leading-tight tracking-tight mb-4 flex items-center gap-2">
                <Check className="w-6 h-6 text-[var(--primary-color-treasurer-details)]" />
                Actions
              </h3>
              <div className="flex flex-col md:flex-row justify-end items-center gap-3">
                <button className="flex w-full md:w-auto items-center justify-center gap-2 rounded-lg h-10 px-6 bg-[var(--secondary-color-treasurer-details)] text-[var(--text-primary-treasurer-details)] text-sm font-semibold leading-normal tracking-wide hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4" />
                  <span className="truncate">Reject</span>
                </button>
                <button className="flex w-full md:w-auto items-center justify-center gap-2 rounded-lg h-10 px-6 bg-[var(--primary-color-treasurer-details)] text-white text-sm font-semibold leading-normal tracking-wide hover:bg-blue-700 transition-colors">
                  <Check className="w-4 h-4" />
                  <span className="truncate">Approve</span>
                </button>
              </div>
            </section>
          </div>
        </main>
        <MainFooter userType="treasurer" activePath="/treasurer/payment-details" />
      </div>
    </div>
  )
=======
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
  const [actionStatus, setActionStatus] = useState<'Approved' | 'Rejected' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch payment + parent details
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
        console.error(' Error fetching payment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  // Approve / Reject handler
  const handleAction = async (newStatus: 'Approved' | 'Rejected') => {
    if (!payment) return;
    setIsProcessing(true);

    try {
      const destinationTable =
        newStatus === 'Approved' ? 'approved_payments' : 'rejected_payments';

      // 1️Insert into target table
      const { error: insertError } = await supabase.from(destinationTable).insert([
        {
          parent_id: payment.parent_id,
          student_name: payment.student_name,
          grade: payment.grade,
          amount: payment.amount,
          proof_url: payment.proof_url,
          created_at: payment.created_at,
          ...(newStatus === 'Approved'
            ? { approved_at: new Date().toISOString() }
            : { rejected_at: new Date().toISOString() }),
        },
      ]);

      if (insertError) throw insertError;

      // 2️ Remove from submitpayment
      const { error: deleteError } = await supabase
        .from('submitpayment')
        .delete()
        .eq('id', payment.id);

      if (deleteError) throw deleteError;

      // Update local state
      setActionStatus(newStatus);
    } catch (err: any) {
      console.error('Error handling action:', err.message);
      alert('Failed to update payment status.');
    } finally {
      setIsProcessing(false);
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
        {/* Header */}
        <div className="border rounded-lg bg-white shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold text-gray-800">
              Pending Payment Details
            </h1>
            <span className="text-sm text-gray-500">
              Date Submitted:{' '}
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
          <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
            Parent Information
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
          <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
            Payment Details
          </h2>

          <table className="w-full text-left border-t">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                  Child’s Name
                </th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Grade</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-700">
                  Payment Proof
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-3 px-4">{payment.student_name}</td>
                <td className="py-3 px-4">{payment.grade}</td>
                <td className="py-3 px-4 text-green-600 font-semibold">
                  MYR {payment.amount.toFixed(2)}
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
          <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex items-center gap-2">
            Actions
          </h2>

          {actionStatus ? (
            <div
              className={`p-4 rounded-md text-center font-semibold ${
                actionStatus === 'Approved'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              Payment has been {actionStatus}.
            </div>
          ) : (
            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => handleAction('Rejected')}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                disabled={isProcessing}
              >
                ✗ {isProcessing ? 'Processing...' : 'Reject'}
              </Button>
              <Button
                onClick={() => handleAction('Approved')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isProcessing}
              >
                ✓ {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
>>>>>>> 1154ffb2c22266ec59215616f3cd37d698bd5526
}
