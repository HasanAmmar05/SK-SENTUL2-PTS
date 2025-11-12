<<<<<<< HEAD
"use client"
import Link from "next/link"
import { MainHeader } from "@/components/main-header"
import { Upload } from "lucide-react"

export default function ParentPaymentPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-slate-100 font-inter text-slate-800">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="parent" activePath="/parent/payment" />
        <main className="px-4 sm:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-8">
          <div className="layout-content-container w-full max-w-5xl space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 mb-8">Make a Payment</h1>
              <section className="mb-8">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Select Student(s) and Enter Amount</h2>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500 w-16">
                          <span className="sr-only">Select</span>
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Student Name
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Grade
                        </th>
                        <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                          Class
                        </th>
                        <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500 w-40">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <input
                            className="checkbox-custom h-5 w-5 rounded border-slate-300 text-[var(--primary-color-parent-payment)] focus:ring-[var(--primary-color-parent-payment)] focus:ring-offset-0"
                            type="checkbox"
                          />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Emily Carter</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">5th</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">Class A</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end">
                            <span className="text-sm text-slate-500 mr-2">$</span>
                            <input
                              className="form-input block w-24 rounded-md border-slate-300 py-2 pr-3 shadow-sm focus:border-[var(--primary-color-parent-payment)] focus:ring-[var(--primary-color-parent-payment)] sm:text-sm placeholder:text-slate-400"
                              name="amount_emily"
                              placeholder="0.00"
                              type="number"
                            />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <input
                            className="checkbox-custom h-5 w-5 rounded border-slate-300 text-[var(--primary-color-parent-payment)] focus:ring-[var(--primary-color-parent-payment)] focus:ring-offset-0"
                            type="checkbox"
                          />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-slate-900">Ethan Carter</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">3rd</td>
                        <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">Class B</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-end">
                            <span className="text-sm text-slate-500 mr-2">$</span>
                            <input
                              className="form-input block w-24 rounded-md border-slate-300 py-2 pr-3 shadow-sm focus:border-[var(--primary-color-parent-payment)] focus:ring-[var(--primary-color-parent-payment)] sm:text-sm placeholder:text-slate-400"
                              name="amount_ethan"
                              placeholder="0.00"
                              type="number"
                            />
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="payment-proof">
                    Payment Proof (Optional)
                  </label>
                  <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-slate-300 px-6 pt-5 pb-6 hover:border-slate-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <div className="flex text-sm text-slate-600">
                        <label
                          className="relative cursor-pointer rounded-md bg-white font-medium text-[var(--primary-color-parent-payment)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--primary-color-parent-payment)] focus-within:ring-offset-2 hover:text-blue-700"
                          htmlFor="file-upload"
                        >
                          <span>Upload a file</span>
                          <input className="sr-only" id="file-upload" name="file-upload" type="file" />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <Link
                    href="/parent/dashboard"
                    className="inline-flex justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-parent-payment)] focus:ring-offset-2"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-[var(--primary-color-parent-payment)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color-parent-payment)] focus:ring-offset-2"
                  >
                    Submit Payment
                  </button>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
=======
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { MainHeader } from '../../../components/MainHeader';

export default function MakePaymentPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<{ [key: string]: number }>({});
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch students belonging to logged-in parent
  useEffect(() => {
  const fetchStudents = async () => {
    try {
      // Use the auth-helpers client if possible:
      // const supabase = createClientComponentClient(); // import from @supabase/auth-helpers-nextjs at top if you switch

      // 1) Inspect session and user
      const sessionResp = await supabase.auth.getSession();
      console.log("sessionResp:", sessionResp);

      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) console.warn("getUser error:", getUserError);
      console.log("user:", user);

      if (!user) {
        // If no user, try to find profile by cookie or show helpful UI/error
        setStudents([]);
        return;
      }

      // Option A: If parent_id in parent_students is auth user id (uuid)
      const parentId = user.id;
      const { data, error } = await supabase
  .from('parent_students')
  .select('id, student_name, student_grade, parent_id')
  .eq('parent_id', parentId);


      if (error) {
        console.error("Failed to load students (by parent_id):", error);
      } else if (data && data.length) {
        setStudents(data);
        return;
      }

      // Option B fallback: if your parent_students links to profiles.email, query via profile row:
      // fetch profile (profiles table) by email
      const { data: profileRows, error: profileErr } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", user.email)
        .maybeSingle();
      console.log("profileRows:", profileRows, "profileErr:", profileErr);
      if (profileErr) {
        console.error("profile lookup failed:", profileErr);
      } else if (profileRows?.id) {
        const { data: children, error: childrenErr } = await supabase
          .from("parent_students")
          .select("id, student_name, grade, student_grade")
          .eq("parent_id", profileRows.id);
        if (childrenErr) console.error("children err:", childrenErr);
        else setStudents(children || []);
        return;
      }

      // no students found
      setStudents([]);
    } catch (err) {
      console.error("Failed to load students:", err);
      setStudents([]);
    }
  };

  fetchStudents();
}, []);

const uploadProof = async () => {
  if (!proofFile) {
    console.warn("No proof file selected.");
    return null;
  }

  try {
    const bucket = "payment_proofs"; // must match your Supabase storage bucket name
    const filePath = `${Date.now()}_${proofFile.name}`;

    console.log(" Uploading:", filePath);

    // Step 1️ Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, proofFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Upload failed:", uploadError.message);
      return null;
    }

    console.log("Upload successful:", uploadData);

    // Step 2️ Manually construct the public URL (bypass getPublicUrl)
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;

    console.log(" Final URL to save:", publicUrl);

    return publicUrl;
  } catch (err: any) {
    console.error("uploadProof() failed:", err);
    return null;
  }
};




// 2 handleSubmit() calls that uploadProof() and uses proofUrl
const handleSubmit = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Please log in again");

    setLoading(true);

    const entriesToInsert: any[] = [];
    for (const s of students) {
      const amt = Number(selected[s.id]);
      if (!isNaN(amt) && amt > 0) {
        entriesToInsert.push({
          parent_id: user.id,
          student_name: s.student_name,
          student_grade: s.student_grade,
          amount: amt,
        });
      }
    }

    if (entriesToInsert.length === 0) {
      alert("Please select at least one student and enter a valid amount.");
      setLoading(false);
      return;
    }

    const proofUrl = await uploadProof(); // use the top one
  console.log("Returned proofUrl:", proofUrl);
    const payload = entriesToInsert.map((e) => ({
      parent_id: e.parent_id,
      student_name: e.student_name,
      grade: e.student_grade,
      amount: e.amount,
      proof_url: proofUrl,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("submitpayment")
      .insert(payload);

    if (insertError) throw insertError;

    alert(" Payment submitted successfully!");
    setSelected({});
    setProofFile(null);
  } catch (err) {
    console.error(" Failed to submit payment:", err);
    alert("Failed to submit payment: " + (err as any)?.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-100">
      <MainHeader/>

      <div className="max-w-6xl mx-auto bg-white p-8 rounded-3xl shadow-md mt-6">
        <h1 className="text-3xl font-bold mb-4">Make a Payment</h1>
        <p className="text-lg font-semibold mb-6">Select Student(s) and Enter Amount</p>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4">STUDENT NAME</th>
                <th className="p-4">GRADE</th>
                <th className="p-4 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id} className="border-t">
                    <td className="p-4 text-center align-middle">
                      <input
                        type="checkbox"
                        checked={selected[s.id] !== undefined}
                        onChange={(e) => {
                          const copy = { ...selected };
                          if (e.target.checked) copy[s.id] = copy[s.id] ?? 0;
                          else delete copy[s.id];
                          setSelected(copy);
                        }}
                      />
                    </td>
                    <td className="p-4 font-medium align-middle">{s.student_name}</td>
                    <td className="p-4 align-middle">{s.student_grade}</td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center">
                        <span className="mr-2">$</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={selected[s.id] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value === '' ? undefined : Number(e.target.value);
                            const copy = { ...selected };
                            if (val === undefined) delete copy[s.id];
                            else copy[s.id] = val;
                            setSelected(copy);
                          }}
                          className="border rounded p-2 w-28 text-right"
                          disabled={selected[s.id] === undefined}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-gray-500">
                    No students found for your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <p className="font-medium mb-2">Payment Proof (Optional)</p>
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer text-blue-600 hover:underline">
              {proofFile ? proofFile.name : 'Upload a file'}
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setSelected({});
              setProofFile(null);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Submitting...' : 'Submit Payment'}
          </Button>
        </div>
      </div>
    </div>
  );
>>>>>>> 1154ffb2c22266ec59215616f3cd37d698bd5526
}
