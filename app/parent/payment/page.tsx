'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { MainHeader } from '@/components/main-header';

export default function MakePaymentPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [selected, setSelected] = useState<{ [key: string]: number }>({});
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 🟢 Fetch students belonging to logged-in parent
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
    console.warn("⚠️ No proof file selected.");
    return null;
  }

  try {
    const bucket = "payment_proofs"; // must match your Supabase storage bucket name
    const filePath = `${Date.now()}_${proofFile.name}`;

    console.log("📤 Uploading:", filePath);

    // Step 1️⃣ Upload file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, proofFile, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("❌ Upload failed:", uploadError.message);
      return null;
    }

    console.log("✅ Upload successful:", uploadData);

    // Step 2️⃣ Manually construct the public URL (bypass getPublicUrl)
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`;

    console.log("🌐 Final URL to save:", publicUrl);

    return publicUrl;
  } catch (err: any) {
    console.error("💥 uploadProof() failed:", err);
    return null;
  }
};




// 2️⃣ handleSubmit() calls that uploadProof() and uses proofUrl
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

    const proofUrl = await uploadProof(); // ✅ use the top one
  console.log("📤 Returned proofUrl:", proofUrl);
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

    alert("✅ Payment submitted successfully!");
    setSelected({});
    setProofFile(null);
  } catch (err) {
    console.error("❌ Failed to submit payment:", err);
    alert("Failed to submit payment: " + (err as any)?.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-100">
      <MainHeader />

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
}
