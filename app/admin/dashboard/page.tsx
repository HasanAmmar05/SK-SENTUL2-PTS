"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { Users, UserCheck, UserX, Plus, Search } from "lucide-react"
import { toggleStaffStatus } from "@/app/admin/actions"

interface StaffMember {
  id: string
  ic_number: string
  email: string
  full_name: string
  phone: string
  role: string
  is_active: boolean
  created_at: string
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    teachers: 0,
    treasurers: 0,
  })

  useEffect(() => {
    checkAdminAccess()
    fetchStaffMembers()
  }, [])

  useEffect(() => {
    filterStaff()
  }, [searchTerm, roleFilter, staffMembers])

  const checkAdminAccess = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!profile || profile.role !== "admin") {
      router.push("/login")
      return
    }
  }

  const fetchStaffMembers = async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("role", ["teacher", "treasurer"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching staff:", error)
      setIsLoading(false)
      return
    }

    setStaffMembers(data || [])

    // Calculate stats
    const total = data?.length || 0
    const active = data?.filter((s) => s.is_active).length || 0
    const inactive = total - active
    const teachers = data?.filter((s) => s.role === "teacher").length || 0
    const treasurers = data?.filter((s) => s.role === "treasurer").length || 0

    setStats({
      totalStaff: total,
      activeStaff: active,
      inactiveStaff: inactive,
      teachers,
      treasurers,
    })

    setIsLoading(false)
  }

  const filterStaff = () => {
    let filtered = staffMembers

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter((staff) => staff.role === roleFilter)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (staff) =>
          staff.full_name.toLowerCase().includes(term) ||
          staff.email.toLowerCase().includes(term) ||
          staff.ic_number.includes(term),
      )
    }

    setFilteredStaff(filtered)
  }

  const handleToggleStatus = async (staffId: string, currentStatus: boolean) => {
    const result = await toggleStaffStatus(staffId, currentStatus)

    if (result.error) {
      alert(result.error)
      return
    }

    // Refresh data
    fetchStaffMembers()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Manage staff members and system settings</p>
            </div>
            <Link
              href="/admin/staff/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Staff
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Total Staff</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalStaff}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Active</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeStaff}</p>
              </div>
              <UserCheck className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Inactive</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactiveStaff}</p>
              </div>
              <UserX className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Teachers</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">{stats.teachers}</p>
              </div>
              <Users className="w-10 h-10 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 font-medium">Treasurers</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">{stats.treasurers}</p>
              </div>
              <Users className="w-10 h-10 text-amber-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, or IC number..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="teacher">Teachers</option>
              <option value="treasurer">Treasurers</option>
            </select>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    IC Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                      Loading staff members...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-slate-500">
                      No staff members found.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{staff.full_name}</div>
                        <div className="text-sm text-slate-500">{staff.phone || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{staff.ic_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{staff.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            staff.role === "teacher" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            staff.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {staff.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/staff/${staff.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(staff.id, staff.is_active)}
                          className={`${
                            staff.is_active ? "text-red-600 hover:text-red-900" : "text-green-600 hover:text-green-900"
                          }`}
                        >
                          {staff.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
