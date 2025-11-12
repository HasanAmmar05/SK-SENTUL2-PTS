export interface TeacherPayment {
  id: string
  studentName: string
  className: string
  amount: number
  dateOfPayment: string
  status: "Confirmed" | "Pending" | "Rejected"
  paymentProof: string
}

// Function to generate a random date within a range
function getRandomDate(start: Date, end: Date): string {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date.toISOString().split("T")[0]
}

// Generate mock data for payments
const studentNames = [
  "Emily Carter",
  "Liam Harper",
  "Olivia Bennett",
  "Noah Foster",
  "Ava Coleman",
  "Sophia Reed",
  "Jackson White",
  "Mia Green",
  "Lucas King",
  "Chloe Hill",
]
const classNames = ["5 A", "5 B", "5 C", "5 D", "5 E"]

const generatePayments = (
  count: number,
  status: "Confirmed" | "Pending" | "Rejected",
  startDate: Date,
  endDate: Date,
): TeacherPayment[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `${status.charAt(0).toLowerCase()}${i + 1}`,
    studentName: studentNames[Math.floor(Math.random() * studentNames.length)],
    className: classNames[Math.floor(Math.random() * classNames.length)],
    amount: Number.parseFloat((Math.random() * 45 + 5).toFixed(2)), // Amounts between RM5 and RM50
    dateOfPayment: getRandomDate(startDate, endDate),
    status: status,
    paymentProof: i % 2 === 0 ? "/images/payment-proof-liam.png" : "/images/payment-proof-olivia.png",
  }))
}

export const teacherConfirmedPayments: TeacherPayment[] = generatePayments(
  30,
  "Confirmed",
  new Date(2024, 0, 1),
  new Date(2024, 5, 30),
)

export const teacherPendingPayments: TeacherPayment[] = generatePayments(
  15,
  "Pending",
  new Date(2024, 5, 1),
  new Date(2024, 7, 31),
)

export const teacherRejectedPayments: TeacherPayment[] = generatePayments(
  5,
  "Rejected",
  new Date(2024, 0, 1),
  new Date(2024, 4, 31),
)

export const teacherDashboardData = {
  totalPaymentsReceived: 1700, // Static value as requested
  totalOutstandingPayments: 2200, // Static value as requested
  studentsPaidCount: teacherConfirmedPayments.length,
  totalStudents: teacherConfirmedPayments.length + teacherPendingPayments.length + teacherRejectedPayments.length,
  paymentsByClass: [
    { className: "5 A", confirmed: 200, pending: 300 },
    { className: "5 B", confirmed: 180, pending: 280 },
    { className: "5 C", confirmed: 150, pending: 250 },
    { className: "5 D", confirmed: 190, pending: 290 },
    { className: "5 E", confirmed: 160, pending: 260 },
    { className: "5 A", confirmed: 170, pending: 270 },
    { className: "5 B", confirmed: 140, pending: 240 },
    { className: "5 C", confirmed: 155, pending: 255 },
    { className: "5 D", confirmed: 165, pending: 265 },
    { className: "5 E", confirmed: 175, pending: 275 },
  ],
}

export function getAllTeacherPayments(): TeacherPayment[] {
  return [...teacherConfirmedPayments, ...teacherPendingPayments, ...teacherRejectedPayments]
}

export function getTeacherPaymentById(id: string): TeacherPayment | undefined {
  return getAllTeacherPayments().find((payment) => payment.id === id)
}
