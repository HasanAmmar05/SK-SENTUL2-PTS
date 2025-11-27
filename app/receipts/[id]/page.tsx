"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import AuthWrapper from "@/components/auth-wrapper"

interface ReceiptPayment {
  id: string
  parent_id: string
  student_name: string
  grade: string
  amount: number
  approved_at?: string | null
  created_at?: string | null
}

function ReceiptContent() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const supabase = createClientComponentClient()
  const [payment, setPayment] = useState<ReceiptPayment | null>(null)
  const [parentName, setParentName] = useState<string>("")
  const [dueAmount, setDueAmount] = useState<number>(0)
  const [issuedDate, setIssuedDate] = useState<string>("")
  const [authorized, setAuthorized] = useState<boolean>(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/")
        return
      }
      const { data: roleCheck } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .single()
      if (!roleCheck) {
        router.push("/")
        return
      }
      let pay: any = null
      const { data: bySubmit } = await supabase
        .from("approved_payments")
        .select("submitpayment_id, parent_id, student_name, grade, amount, approved_at, created_at")
        .eq("submitpayment_id", id)
        .single()
      if (bySubmit) pay = bySubmit
      if (!pay) {
        const { data: byId } = await supabase
          .from("approved_payments")
          .select("id, parent_id, student_name, grade, amount, approved_at, created_at")
          .eq("id", id)
          .single()
        if (byId) pay = { ...byId, submitpayment_id: byId.id }
      }
      if (!pay) return
      if (roleCheck.role === "parent") {
        if (pay.parent_id !== user.id) {
          router.push("/parent/dashboard")
          return
        }
        setAuthorized(true)
      } else if (roleCheck.role === "teacher") {
        const { data: teacher } = await supabase
          .from("teacher_details")
          .select("assigned_classes")
          .eq("user_id", user.id)
          .single()
        if (!teacher?.assigned_classes || !teacher.assigned_classes.includes(pay.grade)) {
          router.push("/teacher/dashboard")
          return
        }
        setAuthorized(true)
      } else {
        router.push("/")
        return
      }
      setPayment({
        id: pay.submitpayment_id || pay.id,
        parent_id: pay.parent_id,
        student_name: pay.student_name,
        grade: pay.grade,
        amount: Number(pay.amount) || 0,
        approved_at: pay.approved_at,
        created_at: pay.created_at,
      })
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", pay.parent_id)
        .single()
      setParentName(profile?.full_name || "")
      const year = (pay.approved_at ? new Date(pay.approved_at) : new Date()).getFullYear()
      const { data: fee } = await supabase
        .from("fees_assignments")
        .select("amount_due")
        .eq("year", year)
        .eq("status", "Active")
        .eq("grade", pay.grade)
        .limit(1)
      setDueAmount(Number(fee?.[0]?.amount_due || 0))
      setIssuedDate(pay.approved_at ? new Date(pay.approved_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0])
    }
    load()
  }, [id])

  if (!payment || !authorized) {
    return (
      <div className="min-h-screen bg-white p-8 flex items-center justify-center">
        <div>Loading receipt...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto border rounded-xl shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Payment Receipt</h1>
          <Button onClick={() => window.print()}>Print / Save as PDF</Button>
        </div>
        <div className="mb-6">
          <div className="text-sm text-slate-600">Receipt Date</div>
          <div className="text-base font-medium">{issuedDate}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="text-sm text-slate-600">Parent Name</div>
            <div className="text-base font-medium">{parentName}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Student</div>
            <div className="text-base font-medium">{payment.student_name}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Class</div>
            <div className="text-base font-medium">{payment.grade}</div>
          </div>
          <div>
            <div className="text-sm text-slate-600">Approved Amount</div>
            <div className="text-base font-medium">MYR {payment.amount.toFixed(2)}</div>
          </div>
        </div>
        <div className="border-t pt-6">
          <div className="text-sm text-slate-600">Total Fee Due</div>
          <div className="text-base font-semibold">MYR {dueAmount.toFixed(2)}</div>
        </div>
        <div className="mt-8 text-sm text-slate-500">Official signature and logo section</div>
      </div>
    </div>
  )
}

export default function ReceiptPage() {
  return (
    <AuthWrapper>
      <ReceiptContent />
    </AuthWrapper>
  )
}