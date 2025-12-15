"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { TeacherSidebar } from "@/components/teacher-sidebar"
import {
  Search,
  DollarSign,
  User,
  CreditCard,
  Loader2,
  School,
  CheckCircle2,
  AlertCircle,
  Banknote,
  ChevronRight,
  Users,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AuthWrapper from "@/components/auth-wrapper"

// Types
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

  // --- Logic State ---
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [assignedClasses, setAssignedClasses] = useState<string[]>([])
  const [classesLoaded, setClassesLoaded] = useState(false)

  // --- Logic Effects ---
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

  // NEW: Debounce Search Effect
  // Triggers search automatically 500ms after user stops typing
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (classesLoaded) {
        if (searchTerm.trim()) {
          handleSearch()
        } else {
          // If search is cleared, revert to initial list
          loadInitialStudents(assignedClasses)
        }
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, classesLoaded])

  const loadInitialStudents = async (classes: string[]) => {
    setIsSearching(true)
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
    setIsSearching(false)
  }

  // --- Handlers ---
  const handleSearch = async () => {
    if (!classesLoaded || !searchTerm.trim()) return
    setIsSearching(true)

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
    setIsSearching(false)
  }

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
      alert("Cash payment submitted successfully.")
      setSelectedStudent(null)
      setAmount("")
      setNote("")
      setSearchTerm("")
    }
    setIsLoading(false)
  }

  // --- UI Render ---
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <TeacherSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header - Blue Theme */}
        <div className="flex-none px-6 py-5 bg-white border-b border-blue-100 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Cash Collection
                </h1>
                <p className="text-sm text-slate-500 font-medium">
                  Record payments for assigned classes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            
            {/* LEFT COLUMN: Search & Student List */}
            <div className="lg:col-span-5 flex flex-col gap-4 h-full min-h-[500px]">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                
                {/* Search Header - Improved for Direct Search */}
                <div className="p-4 border-b border-slate-100 space-y-3 bg-white z-10">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs font-bold text-blue-900/60 uppercase tracking-wider">
                      Student Search
                    </Label>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                       {searchResults.length} Results
                    </span>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                      <Search className="w-4 h-4" />
                    </div>
                    <Input
                      placeholder="Start typing name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-9 h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all rounded-xl"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isSearching ? (
                            <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                        ) : searchTerm ? (
                            <button 
                                onClick={() => setSearchTerm("")}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        ) : null}
                    </div>
                  </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-slate-50/50 custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`w-full group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border text-left ${
                          selectedStudent?.id === student.id
                            ? "bg-blue-50 border-blue-200 shadow-sm z-10"
                            : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm"
                        }`}
                      >
                        {/* Avatar */}
                        <div
                          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                            selectedStudent?.id === student.id
                              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                              : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"
                          }`}
                        >
                          <span className="text-sm font-bold">
                            {student.student_name.charAt(0)}
                          </span>
                        </div>

                        {/* Text Info */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${
                            selectedStudent?.id === student.id ? "text-blue-900" : "text-slate-900"
                          }`}>
                            {student.student_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs mt-0.5">
                             <span className="font-medium text-slate-500 bg-slate-100 px-1.5 rounded border border-slate-200">
                               {student.student_grade}
                             </span>
                             <span className="text-slate-400 truncate">
                               Parent: {student.parent_name}
                             </span>
                          </div>
                        </div>

                        {/* Indicator */}
                        {selectedStudent?.id === student.id ? (
                           <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        ) : (
                           <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <Users className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">No students found</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-[180px]">
                        Try searching by name or ensure you have classes assigned.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Payment Form */}
            <div className="lg:col-span-7 h-full min-h-[500px]">
              {selectedStudent ? (
                <div className="h-full flex flex-col bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                  
                  {/* Form Header */}
                  <div className="flex-none p-6 border-b border-slate-100 bg-white flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        Payment Details
                      </h2>
                      <p className="text-sm text-slate-500">Processing cash transaction</p>
                    </div>
                    <div className="text-right">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                         Active Session
                       </span>
                    </div>
                  </div>

                  {/* Scrollable Form Content */}
                  <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-md mx-auto space-y-8">
                      
                      {/* Blue Student Summary Card */}
                      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <School className="w-24 h-24" />
                        </div>
                        <div className="relative z-10 flex items-start gap-4">
                            <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/10 shadow-inner">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Beneficiary</p>
                                <h3 className="text-xl font-bold leading-tight">{selectedStudent.student_name}</h3>
                                <div className="flex items-center gap-3 mt-2 text-sm text-blue-100">
                                    <span className="bg-blue-900/30 px-2 py-0.5 rounded text-xs backdrop-blur-md border border-white/10">
                                        Class {selectedStudent.student_grade}
                                    </span>
                                </div>
                            </div>
                        </div>
                      </div>

                      {/* Inputs */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-slate-700 font-semibold">
                            Payment Amount
                          </Label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <DollarSign className="w-6 h-6 text-blue-300" />
                            </div>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="0.00"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="pl-12 h-16 text-3xl font-bold text-slate-900 placeholder:text-slate-200 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl shadow-sm transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="note" className="text-slate-700 font-semibold">
                            Remarks <span className="font-normal text-slate-400">(Optional)</span>
                          </Label>
                          <Input
                            id="note"
                            placeholder="e.g. Monthly Fees..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="h-12 border-slate-200 focus:border-blue-500 rounded-xl bg-slate-50 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex-none p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4 items-center justify-between lg:justify-end">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedStudent(null)
                        setAmount("")
                        setNote("")
                      }}
                      className="text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitCashPayment}
                      disabled={isLoading || !amount || Number(amount) <= 0}
                      className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 rounded-xl font-semibold transition-all active:scale-[0.98]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm Payment
                          <CreditCard className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Empty State - Blue Theme */
                <div className="h-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6 border border-slate-100">
                    <div className="bg-blue-50 p-3 rounded-full">
                        <AlertCircle className="w-8 h-8 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    Ready to Record
                  </h3>
                  <p className="text-slate-500 max-w-sm leading-relaxed">
                    Start typing a student's name in the search box to begin recording a new cash payment.
                  </p>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  )
}