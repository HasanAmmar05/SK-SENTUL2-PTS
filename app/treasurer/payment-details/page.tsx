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
        console.log('🔍 Fetching payment with ID:', id);
        
        // First, try to fetch from submitpayment (pending payments)
        let { data: paymentData, error: paymentError } = await supabase
          .from('submitpayment')
          .select('*')
          .eq('id', id)
          .single();

        if (paymentData) {
          console.log('✅ Found in submitpayment (pending):', paymentData);
        }

        // If not found, try approved_payments using submitpayment_id
        if (paymentError) {
          console.log('⚠️ Not in submitpayment, checking approved_payments...');
          const { data: approvedData, error: approvedError } = await supabase
            .from('approved_payments')
            .select('*')
            .eq('submitpayment_id', id)
            .single();

          if (!approvedError && approvedData) {
            console.log('✅ Found in approved_payments:', approvedData);
            paymentData = {
              ...approvedData,
              id: approvedData.submitpayment_id || id, // Use the original ID
              status: 'Approved'
            };
            paymentError = null;
          } else {
            console.log('⚠️ Not in approved_payments, checking rejected_payments...');
            // If not in approved, try rejected_payments using submitpayment_id
            const { data: rejectedData, error: rejectedError } = await supabase
              .from('rejected_payments')
              .select('*')
              .eq('submitpayment_id', id)
              .single();

            if (!rejectedError && rejectedData) {
              console.log('✅ Found in rejected_payments:', rejectedData);
              paymentData = {
                ...rejectedData,
                id: rejectedData.submitpayment_id || id, // Use the original ID
                status: 'Rejected'
              };
              paymentError = null;
            } else {
              console.log('❌ Not found in any table');
            }
          }
        }

        if (paymentError || !paymentData) {
          console.error('❌ Payment not found. Error:', paymentError);
          console.error('Searched ID:', id);
          throw new Error('Payment not found');
        }
        
        console.log('📋 Final payment data:', paymentData);
        setPayment(paymentData);

        // Set action status if already processed
        if (paymentData.status === 'Approved' || paymentData.status === 'Rejected') {
          setActionStatus(paymentData.status);
        }

        if (paymentData.parent_id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', paymentData.parent_id)
            .single();

          if (profileError) {
            console.error('❌ Profile fetch error:', profileError);
            throw profileError;
          }
          console.log('✅ Parent profile:', profileData);
          setParent(profileData);
        }
      } catch (err) {
        console.error('❌ Error fetching payment details:', err);
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

      // Prepare the data to insert
      const dataToInsert = {
        submitpayment_id: payment.id, // Store the original payment ID
        parent_id: payment.parent_id,
        student_name: payment.student_name,
        grade: payment.grade,
        amount: payment.amount,
        proof_url: payment.proof_url,
        created_at: payment.created_at,
        ...(newStatus === 'Approved'
          ? { approved_at: new Date().toISOString() }
          : { rejected_at: new Date().toISOString() }),
      };

      console.log('📤 Inserting into', destinationTable, ':', dataToInsert);

      // 1️⃣ Insert into target table with submitpayment_id
      const { data: insertedData, error: insertError } = await supabase
        .from(destinationTable)
        .insert([dataToInsert])
        .select();

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }

      console.log('✅ Insert successful:', insertedData);

      // 2️⃣ Remove from submitpayment
      const { error: deleteError } = await supabase
        .from('submitpayment')
        .delete()
        .eq('id', payment.id);

      if (deleteError) {
        console.error('❌ Delete error:', deleteError);
        throw deleteError;
      }

      console.log('✅ Deleted from submitpayment');

      // Update local state
      setActionStatus(newStatus);
      setPayment({ ...payment, status: newStatus });
      
      alert(`Payment ${newStatus.toLowerCase()} successfully!`);
    } catch (err: any) {
      console.error('❌ Error handling action:', err.message, err);
      alert('Failed to update payment status: ' + err.message);
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
              {actionStatus ? `${actionStatus} Payment Details` : 'Pending Payment Details'}
            </h1>
            <span className="text-sm text-gray-500">
              Date Submitted:{' '}
              {payment.created_at
                ? format(new Date(payment.created_at), 'MMM dd, yyyy')
                : '-'}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            {actionStatus 
              ? `This payment has been ${actionStatus.toLowerCase()}.`
              : 'Review and approve or reject the payment details submitted by the parent.'}
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
                  Child's Name
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
}