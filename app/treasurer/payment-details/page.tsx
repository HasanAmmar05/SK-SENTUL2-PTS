"use client"
import Image from "next/image"
import { MainHeader } from "@/components/main-header"
import { MainFooter } from "@/components/main-footer"
import { Calendar, User, ReceiptText, X, Check } from "lucide-react"

export default function TreasurerPaymentDetailsPage() {
  return (
    <div className="relative flex size-full min-h-screen flex-col group/design-root overflow-x-hidden bg-[var(--background-color-treasurer-details)]">
      <div className="layout-container flex h-full grow flex-col">
        <MainHeader userType="treasurer" activePath="/treasurer/payment-details" />
        <main className="px-10 md:px-20 lg:px-40 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col max-w-5xl flex-1 gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-[var(--border-color-treasurer-details)]">
              <div>
                <h2 className="text-[var(--text-primary-treasurer-details)] text-2xl font-semibold leading-tight">
                  Pending Payment Details
                </h2>
                <p className="text-[var(--text-secondary-treasurer-details)] text-sm font-normal leading-normal mt-1">
                  Review and approve or reject the payment details submitted by the parent.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-[var(--text-secondary-treasurer-details)]">
                <Calendar className="w-4 h-4" />
                <span>Date Submitted: Oct 26, 2023</span>
              </div>
            </div>
            <section className="bg-white rounded-lg shadow-sm border border-[var(--border-color-treasurer-details)] p-6">
              <h3 className="text-[var(--text-primary-treasurer-details)] text-xl font-semibold leading-tight tracking-tight mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-[var(--primary-color-treasurer-details)]" />
                Parent Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="border-t border-[var(--border-color-treasurer-details)] pt-4">
                  <p className="text-[var(--text-secondary-treasurer-details)] text-xs font-medium leading-normal">
                    Parent Name
                  </p>
                  <p className="text-[var(--text-primary-treasurer-details)] text-base font-medium leading-normal mt-1">
                    Sophia Clark
                  </p>
                </div>
                <div className="border-t border-[var(--border-color-treasurer-details)] pt-4">
                  <p className="text-[var(--text-secondary-treasurer-details)] text-xs font-medium leading-normal">
                    Contact Information
                  </p>
                  <p className="text-[var(--text-primary-treasurer-details)] text-base font-medium leading-normal mt-1">
                    sophia.clark@email.com
                  </p>
                </div>
              </div>
            </section>
            <section className="bg-white rounded-lg shadow-sm border border-[var(--border-color-treasurer-details)] p-6">
              <h3 className="text-[var(--text-primary-treasurer-details)] text-xl font-semibold leading-tight tracking-tight mb-4 flex items-center gap-2">
                <ReceiptText className="w-6 h-6 text-[var(--primary-color-treasurer-details)]" />
                Payment Details
              </h3>
              <div className="overflow-x-auto @container">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-[var(--border-color-treasurer-details)]">
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Child's Name
                      </th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Paid Amount
                      </th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Remaining Amount
                      </th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Current Payment
                      </th>
                      <th className="px-4 py-3 text-left text-[var(--text-secondary-treasurer-details)] text-xs font-medium uppercase tracking-wider">
                        Payment Proof
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color-treasurer-details)]">
                    <tr>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-primary-treasurer-details)] text-sm font-medium">
                        Liam Clark
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary-treasurer-details)] text-sm">
                        $250.00
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary-treasurer-details)] text-sm">
                        $0.00
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-green-600 text-sm font-semibold">$250.00</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Image
                          alt="Payment Proof for Liam Clark"
                          className="payment-proof-thumbnail"
                          src="/images/payment-proof-liam.png"
                          width={40}
                          height={40}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-primary-treasurer-details)] text-sm font-medium">
                        Olivia Clark
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary-treasurer-details)] text-sm">
                        $250.00
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-[var(--text-secondary-treasurer-details)] text-sm">
                        $0.00
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-green-600 text-sm font-semibold">$250.00</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Image
                          alt="Payment Proof for Olivia Clark"
                          className="payment-proof-thumbnail"
                          src="/images/payment-proof-olivia.png"
                          width={40}
                          height={40}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
            <section className="bg-white rounded-lg shadow-sm border border-[var(--border-color-treasurer-details)] p-6">
              <h3 className="text-[var(--text-primary-treasurer-details)] text-xl font-semibold leading-tight tracking-tight mb-4 flex items-center gap-2">
                <Check className="w-6 h-6 text-[var(--primary-color-treasurer-details)]" />
                Actions
              </h3>
              <div className="flex flex-col md:flex-row justify-end items-center gap-3">
                <button className="flex w-full md:w-auto items-center justify-center gap-2 rounded-lg h-10 px-6 bg-[var(--secondary-color-treasurer-details)] text-[var(--text-primary-treasurer-details)] text-sm font-semibold leading-normal tracking-wide hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4" />
                  <span className="truncate">Reject</span>
                </button>
                <button className="flex w-full md:w-auto items-center justify-center gap-2 rounded-lg h-10 px-6 bg-[var(--primary-color-treasurer-details)] text-white text-sm font-semibold leading-normal tracking-wide hover:bg-blue-700 transition-colors">
                  <Check className="w-4 h-4" />
                  <span className="truncate">Approve</span>
                </button>
              </div>
            </section>
          </div>
        </main>
        <MainFooter userType="treasurer" activePath="/treasurer/payment-details" />
      </div>
    </div>
  )
}
