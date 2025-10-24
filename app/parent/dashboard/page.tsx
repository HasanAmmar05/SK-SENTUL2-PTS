"use client"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"

export default function ParentChildrenInfoPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-slate-100 font-inter text-slate-800">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="parent" activePath="/parent/dashboard" />
        <main className="px-4 sm:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-5xl">
            <div className="flex flex-wrap justify-between items-center gap-4 p-6 mb-8 bg-white rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900">My Children</h1>
            </div>
            <section className="mb-10 bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold leading-tight text-slate-800">Emily Carter</h2>
                <span className="text-sm font-medium text-[var(--primary-color-parent-payment)]">Grade 5</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-b border-slate-200 pb-6">
                <div>
                  <p className="text-sm font-medium text-slate-600">Remaining Tuition Fees</p>
                  <p className="text-2xl font-bold text-red-600">MYR 20.00</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Paid So Far</p>
                  <p className="text-2xl font-bold text-green-600">MYR 25.00</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold leading-tight text-slate-800 mb-4">Transaction History</h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Description</th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                      <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    <tr>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-900">2024-07-15</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">Tuition Payment - July</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-slate-900">-MYR 15.00</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 status-completed">Completed</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-900">2024-06-15</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">Tuition Payment - June</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-slate-900">-MYR 10.00</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 status-completed">Completed</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-900">2024-05-15</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">Activity Fee - Art Club</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-slate-900">-MYR 5.00</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 status-completed">Completed</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-900">2024-05-01</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">Tuition Payment - May</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-slate-900">-MYR 10.00</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 status-completed">Completed</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold leading-tight text-slate-800">Ethan Carter</h2>
                <span className="text-sm font-medium text-[var(--primary-color-parent-payment)]">Grade 2</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-b border-slate-200 pb-6">
                <div>
                  <p className="text-sm font-medium text-slate-600">Remaining Tuition Fees</p>
                  <p className="text-2xl font-bold text-red-600">MYR 15.00</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Paid So Far</p>
                  <p className="text-2xl font-bold text-green-600">MYR 10.00</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold leading-tight text-slate-800 mb-4">Transaction History</h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Date</th>
                      <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Description</th>
                      <th className="px-5 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Amount</th>
                      <th className="px-5 py-3 text-center text-xs font-medium uppercase tracking-wider text-slate-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    <tr>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-900">2024-07-15</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">Tuition Payment - July</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-slate-900">-MYR 10.00</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 status-completed">Completed</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-900">2024-06-15</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">Tuition Payment - June</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-slate-900">-MYR 10.00</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 status-completed">Completed</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-900">2024-05-15</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600">Tuition Payment - May</td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-right text-slate-900">-MYR 5.00</td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 status-pending">Pending</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
        <MainFooter userType="parent" activePath="/parent/dashboard" />
      </div>
    </div>
  )
}
