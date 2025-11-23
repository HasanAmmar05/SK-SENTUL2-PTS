"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import { Search, DollarSign, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthWrapper from "@/components/auth-wrapper"

interface Student {
  id: string
  student_name: string
  student_grade: string
  parent_id: string
  parent_name: string
}

export default function TeacherCashPaymentPage() {
  return (
    <AuthWrapper>
      <CashPaymentContent />
    </AuthWrapper>
  )
}

function CashPaymentContent() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [assignedClasses, setAssignedClasses] = useState<string[]>([])
  const [classesLoaded, setClassesLoaded] = useState(false)

  // Fetch teacher's assigned classes on mount
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/teacher/login")
        return
      }
      const { data: teacher } = await supabase
        .from("teacher_details")
        .select("assigned_classes")
        .eq("user_id", user.id)
        .single()
      if (teacher?.assigned_classes) {
        setAssignedClasses(teacher.assigned_classes)
        setClassesLoaded(true)
        await loadInitialStudents(teacher.assigned_classes)
      }
    }
    fetchTeacherClasses()
  }, [])

  const loadInitialStudents = async (classes: string[]) => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("parent_students")
      .select("id, student_name, student_grade, parent_id, profiles(full_name)")
      .in("student_grade", classes)
      .limit(20)
    if (error) {
      setSearchResults([])
    } else {
      const mapped = (data || []).map((d: any) => ({
        id: d.id,
        student_name: d.student_name,
        student_grade: d.student_grade,
        parent_id: d.parent_id,
        parent_name: d.profiles?.full_name || "",
      }))
      setSearchResults(mapped)
    }
    setIsLoading(false)
  }

  // Search students by name or parent name within assigned classes
  const handleSearch = async () => {
    if (!classesLoaded || !searchTerm.trim()) return
    setIsLoading(true)

    const { data: byStudent, error: studentErr } = await supabase
      .from("parent_students")
      .select("id, student_name, student_grade, parent_id, profiles(full_name)")
      .ilike("student_name", `%${searchTerm}%`)
      .in("student_grade", assignedClasses)
      .limit(20)

    const { data: parents, error: parentErr } = await supabase
      .from("profiles")
      .select("id, full_name")
      .ilike("full_name", `%${searchTerm}%`)

    let byParent: any[] = []
    if (!parentErr && parents && parents.length > 0) {
      const parentIds = parents.map((p: any) => p.id)
      const { data: parentMatches } = await supabase
        .from("parent_students")
        .select("id, student_name, student_grade, parent_id")
        .in("parent_id", parentIds)
        .in("student_grade", assignedClasses)
        .limit(20)
      byParent = parentMatches || []
    }

    if (studentErr) {
      setSearchResults([])
    } else {
      const map = new Map<string, Student>()
      const add = (row: any, nameMap?: Map<string, string>) => {
        const parentName = row.profiles?.full_name || nameMap?.get(row.parent_id) || ""
        map.set(row.id, {
          id: row.id,
          student_name: row.student_name,
          student_grade: row.student_grade,
          parent_id: row.parent_id,
          parent_name: parentName,
        })
      }
      const nameMap = new Map<string, string>()
      ;(parents || []).forEach((p: any) => nameMap.set(p.id, p.full_name))
      ;(byStudent || []).forEach((r: any) => add(r))
      byParent.forEach((r: any) => add(r, nameMap))
      setSearchResults(Array.from(map.values()))
    }
    setIsLoading(false)
  }

  // Submit cash payment record to submitpayment table with status Pending
  const handleSubmitCashPayment = async () => {
    if (!selectedStudent || !amount || Number(amount) <= 0) return

    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/teacher/login")
      return
    }

    const payload = {
      parent_id: selectedStudent.parent_id,
      student_name: selectedStudent.student_name,
      grade: selectedStudent.student_grade,
      amount: Number(amount),
      proof_url: null,
      status: "Pending",
      created_at: new Date().toISOString(),
    }

    const { error } = await supabase.from("submitpayment").insert(payload)

    if (error) {
      console.error("Submit cash payment error:", error)
      alert("Failed to submit cash payment. Please try again.")
    } else {
      alert("Cash payment submitted successfully and is pending treasurer verification.")
      // Reset form
      setSelectedStudent(null)
      setAmount("")
      setNote("")
      setSearchTerm("")
      setSearchResults([])
    }
    setIsLoading(false)
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[var(--background-color-teacher)] group/design-root overflow-x-hidden">
      <div className="flex h-full grow flex-row">
        <TeacherSidebar />
        <main className="flex-1 bg-[var(--background-color-teacher)] p-8">
          <div className="max-w-3xl mx-auto">
            <header className="mb-8">
              <h1 className="text-[var(--text-primary-teacher)] text-3xl font-bold leading-tight tracking-tight">
                Record Cash Payment
              </h1>
              <p className="text-[var(--text-secondary-teacher)] text-base font-normal leading-normal">
                Search for a student in your assigned classes and record a cash payment on their behalf.
              </p>
            </header>

            {/* Search Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
              <Label className="block text-sm font-medium text-slate-700 mb-2">
                Search Student or Parent
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Enter student name or parent name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={isLoading || !searchTerm.trim()}>
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-slate-600 mb-2">Select a student:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((student) => (
                      <div
                        key={student.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedStudent?.id === student.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:bg-slate-50"
                        }`}
                        onClick={() => setSelectedStudent(student)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900">{student.student_name}</p>
                            <p className="text-sm text-slate-600">Class: {student.student_grade}</p>
                            <p className="text-sm text-slate-500">Parent: {student.parent_name}</p>
                          </div>
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Form */}
            {selectedStudent && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Record Cash Payment</h2>
                <div className="space-y-4">
                  <div>
                    <Label className="block text-sm font-medium text-slate-700 mb-1">Selected Student</Label>
                    <p className="text-slate-900 font-medium">{selectedStudent.student_name}</p>
                    <p className="text-sm text-slate-600">Class: {selectedStudent.student_grade}</p>
                  </div>

                  <div>
                    <Label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">
                      Amount (RM)
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="note" className="block text-sm font-medium text-slate-700 mb-1">
                      Note (optional)
                    </Label>
                    <Input
                      id="note"
                      placeholder="Optional note for treasurer"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSubmitCashPayment}
                      disabled={isLoading || !amount || Number(amount) <= 0}
                    >
                      {isLoading ? "Submitting..." : "Submit Cash Payment"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedStudent(null)
                        setAmount("")
                        setNote("")
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}