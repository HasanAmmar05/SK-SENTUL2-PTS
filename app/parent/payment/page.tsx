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
}
