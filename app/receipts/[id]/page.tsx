"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import AuthWrapper from "@/components/auth-wrapper";
import { Printer, AlertCircle } from "lucide-react";

// --- Types ---
interface ReceiptData {
  id: string;
  parent_id: string;
  parent_name: string;
  student_name: string;
  grade: string;
  amount: number;
  approved_at: string;
  issued_date: string;
  due_amount: number;
  total_paid_history: number;
  balance: number;
}

interface FetchState {
  data: ReceiptData | null;
  loading: boolean;
  error: string | null;
}

// --- Custom Hook for Data Logic ---
function useReceiptData(paymentId: string) {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [state, setState] = useState<FetchState>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      // 1. Auth Check
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }

      const { data: roleCheck } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single();

      if (!roleCheck) throw new Error("Unauthorized");

      // 2. Fetch Payment Record
      let rawPayment: any = null;
      
      const { data: bySubmit } = await supabase
        .from("approved_payments")
        .select("*")
        .eq("submitpayment_id", paymentId)
        .single();
        
      if (bySubmit) rawPayment = bySubmit;
      else {
        const { data: byId } = await supabase
          .from("approved_payments")
          .select("*")
          .eq("id", paymentId)
          .single();
        if (byId) rawPayment = { ...byId, submitpayment_id: byId.id };
      }

      if (!rawPayment) throw new Error("Receipt not found");

      // 3. Authorization Logic
      let isAuthorized = false;
      if (roleCheck.role === "parent") {
        if (rawPayment.parent_id === user.id) isAuthorized = true;
      } else if (roleCheck.role === "teacher") {
        const { data: teacher } = await supabase
          .from("teacher_details")
          .select("assigned_classes")
          .eq("user_id", user.id)
          .single();
        if (teacher?.assigned_classes?.includes(rawPayment.grade)) isAuthorized = true;
      } else if (roleCheck.role === "treasurer") {
        isAuthorized = true;
      }

      if (!isAuthorized) {
        router.push("/parent/dashboard");
        return;
      }

      // 4. Fetch Auxiliary Data
      const year = (rawPayment.approved_at ? new Date(rawPayment.approved_at) : new Date()).getFullYear();
      
      const [profileReq, feeReq, historyReq] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", rawPayment.parent_id).single(),
        supabase.from("fees_assignments").select("amount_due").eq("year", year).eq("status", "Active").eq("grade", rawPayment.grade).limit(1),
        supabase.from("approved_payments")
          .select("amount")
          .eq("student_name", rawPayment.student_name)
          .eq("grade", rawPayment.grade)
          .gte("approved_at", `${year}-01-01`)
          .lt("approved_at", `${year + 1}-01-01`)
      ]);

      const parentName = profileReq.data?.full_name || "Unknown";
      const dueAmount = Number(feeReq.data?.[0]?.amount_due || 0);
      const totalPaid = (historyReq.data || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      const balance = Math.max(dueAmount - totalPaid, 0);

      setState({
        loading: false,
        error: null,
        data: {
          id: rawPayment.submitpayment_id || rawPayment.id,
          parent_id: rawPayment.parent_id,
          parent_name: parentName,
          student_name: rawPayment.student_name,
          grade: rawPayment.grade,
          amount: Number(rawPayment.amount) || 0,
          approved_at: rawPayment.approved_at,
          issued_date: rawPayment.approved_at
            ? new Date(rawPayment.approved_at).toLocaleDateString("en-MY", { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date().toLocaleDateString("en-MY"),
          due_amount: dueAmount,
          total_paid_history: totalPaid,
          balance: balance,
        },
      });

    } catch (err) {
      console.error(err);
      setState({ data: null, loading: false, error: "Could not load receipt." });
    }
  }, [paymentId, router, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return state;
}

// --- Components ---

function ReceiptSkeleton() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 border rounded-xl space-y-8 animate-pulse">
      <div className="h-24 bg-slate-100 rounded-lg w-full" />
      <div className="flex justify-between">
        <div className="h-8 bg-slate-100 w-1/3 rounded" />
        <div className="h-8 bg-slate-100 w-1/4 rounded" />
      </div>
      <div className="h-32 bg-slate-100 rounded-lg w-full" />
      <div className="h-40 bg-slate-100 rounded-lg w-full" />
    </div>
  );
}

function ReceiptContent() {
  const params = useParams();
  const { data: receipt, loading, error } = useReceiptData(params.id as string);

  if (loading) return <div className="min-h-screen bg-slate-50 p-8"><ReceiptSkeleton /></div>;
  if (error || !receipt) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-slate-500">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <p>{error || "Receipt not found"}</p>
    </div>
  );

  return (
    <>
      {/* 
        This style block forces the print engine to use minimal margins 
        and allows us to use the full A4 height.
      */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 10mm;
            size: auto;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-100 p-6 md:p-12 print:bg-white print:p-0 print:min-h-0">
        
        {/* Action Bar (Hidden on Print) */}
        <div className="max-w-3xl mx-auto mb-6 flex justify-end gap-3 print:hidden">
          <Button 
            variant="outline" 
            onClick={() => window.print()}
            className="bg-white hover:bg-slate-50 border-slate-300 shadow-sm text-slate-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Receipt
          </Button>
        </div>

        {/* Main Receipt Card */}
        {/* 
           UPDATES: 
           1. Added print:p-8 to reduce padding from web's p-12. 
           2. Added break-inside-avoid to prevent splitting.
        */}
        <div className="relative max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl shadow-lg p-8 md:p-12 overflow-hidden print:shadow-none print:border-0 print:rounded-none print:w-full print:max-w-none print:p-6 print:break-inside-avoid">
          
          {/* Paid Watermark */}
          <div className="absolute top-8 right-8 pointer-events-none opacity-10 print:opacity-20">
               <Image src="/School_Logo.png" alt="" width={400} height={400} className="object-contain grayscale" />
          </div>
          
          {/* Header */}
          {/* UPDATE: Reduced print margin to print:mb-4 */}
          <header className="relative z-10 flex flex-col items-center text-center border-b-2 border-slate-900 pb-8 mb-8 print:pb-4 print:mb-4">
            <div className="mb-4 print:mb-2">
               <Image
                src="/School_Logo.png"
                alt="School Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-slate-900 print:text-xl">
              Persatuan Ibubapa Dan Guru (PIBG)
            </h1>
            <h2 className="text-lg md:text-xl font-semibold uppercase tracking-wide text-slate-800 print:text-lg">
              Sekolah Kebangsaan Sentul 2
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Jalan Sentul, 51000 Kuala Lumpur
            </p>
          </header>

          {/* Meta Data Row */}
          {/* UPDATE: Reduced print margin to print:mb-6 */}
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:mb-6">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 print:text-xl">Official Receipt</h3>
              <p className="text-sm text-slate-500">Document Reference</p>
            </div>
            <div className="flex flex-col items-start md:items-end text-left md:text-right w-full md:w-auto">
               <div className="bg-slate-50 px-3 py-1 rounded border border-slate-200 inline-block print:border-slate-300">
                  <span className="text-xs font-bold text-slate-500 uppercase mr-2">Receipt No:</span>
                  <span className="font-mono font-medium text-slate-900">#{receipt.id.slice(0, 8).toUpperCase()}</span>
               </div>
               <div className="mt-1 text-sm font-medium text-slate-600">
                 Date: {receipt.issued_date}
               </div>
            </div>
          </div>

          {/* Bill To Section */}
          {/* UPDATE: Reduced print margin to print:mb-6 and gap */}
          <div className="relative z-10 grid md:grid-cols-2 gap-8 mb-10 print:mb-6 print:gap-4">
            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 print:border-slate-300 print:p-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Received From</h4>
              <p className="text-lg font-semibold text-slate-900 print:text-base">{receipt.parent_name}</p>
              <p className="text-sm text-slate-600">Parent / Guardian</p>
            </div>
            <div className="bg-slate-50/50 p-4 rounded-lg border border-slate-100 print:border-slate-300 print:p-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">For Student</h4>
              <p className="text-lg font-semibold text-slate-900 print:text-base">{receipt.student_name}</p>
              <div className="flex items-center gap-2 mt-1">
                 <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-slate-900 shadow-sm print:border-slate-400">
                    Grade {receipt.grade}
                 </span>
              </div>
            </div>
          </div>

          {/* Table */}
          {/* UPDATE: Reduced print margin */}
          <div className="relative z-10 mb-10 print:mb-4">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900 text-white print:bg-slate-100 print:text-black print:border-y print:border-slate-300">
                  <th className="py-3 px-4 text-left font-medium rounded-l-md print:rounded-none">Description</th>
                  <th className="py-3 px-4 text-right font-medium rounded-r-md print:rounded-none">Amount (MYR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                <tr>
                  <td className="py-4 px-4 text-slate-700 font-medium">Fee Payment</td>
                  <td className="py-4 px-4 text-right font-medium text-slate-900">{receipt.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total & Stamp */}
          <div className="relative z-10 flex justify-end items-center border-t border-slate-200 pt-6 print:pt-4">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 px-4 print:py-1">
                 <span className="text-slate-600">Subtotal</span>
                 <span className="font-medium">MYR {receipt.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 px-4 print:py-2">
                 <span className="text-lg font-bold text-slate-900">Total Paid</span>
                 <span className="text-xl font-bold text-slate-900">MYR {receipt.amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Print Footer */}
          {/* UPDATE: Reduced top margin significantly for print */}
          <div className="relative z-10 mt-12 text-center text-xs text-slate-400 print:text-black print:mt-8">
            <p>This is a computer-generated receipt. No signature is required.</p>
            <p>Generated on {new Date().toLocaleString('en-MY')}</p>
          </div>

        </div>
      </div>
    </>
  );
}

export default function ReceiptPage() {
  return (
    <AuthWrapper>
      <ReceiptContent />
    </AuthWrapper>
  );
}