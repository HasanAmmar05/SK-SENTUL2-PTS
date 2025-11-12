// lib/data.ts
export interface PaymentData {
  studentName: string
  class: string
  parentName: string
  totalAmount: number
  amountPaid: number
  remainingAmount: number
  status: "full" | "partial" | "rejected"
  date: string
}

export interface HistoricalPaymentData {
  paymentDate: string
  parentName: string
  children: string
  totalAmount: number
  status: "completed" | "pending" | "rejected" | "partial"
  grade: string
}

// Function to generate a random integer within a range
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Function to generate a random date within the last X days
function getRandomDate(daysAgo: number): string {
  const today = new Date()
  const pastDate = new Date(today.setDate(today.getDate() - getRandomInt(1, daysAgo)))
  return pastDate.toISOString().split("T")[0]
}

// Treasurer Dashboard Data
const initialDashboardPaymentData: PaymentData[] = [
  {
    studentName: "Liam Carter",
    class: "Grade 5",
    parentName: "Sophia Carter",
    totalAmount: 25,
    amountPaid: 15,
    remainingAmount: 10,
    status: "partial",
    date: "2024-01-15",
  },
  {
    studentName: "Olivia Bennett",
    class: "Grade 6",
    parentName: "Ethan Bennett",
    totalAmount: 25,
    amountPaid: 25,
    remainingAmount: 0,
    status: "full",
    date: "2024-01-16",
  },
  {
    studentName: "Noah Harper",
    class: "Grade 5",
    parentName: "Ava Harper",
    totalAmount: 25,
    amountPaid: 25,
    remainingAmount: 0,
    status: "full",
    date: "2024-01-17",
  },
  {
    studentName: "Emma Foster",
    class: "Grade 6",
    parentName: "Lucas Foster",
    totalAmount: 25,
    amountPaid: 10,
    remainingAmount: 15,
    status: "partial",
    date: "2024-01-18",
  },
  {
    studentName: "Jackson Reed",
    class: "Grade 5",
    parentName: "Chloe Reed",
    totalAmount: 25,
    amountPaid: 25,
    remainingAmount: 0,
    status: "full",
    date: "2024-01-19",
  },
]

const studentNames = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Heidi",
  "Ivan",
  "Judy",
  "Kevin",
  "Linda",
  "Mike",
  "Nancy",
  "Oscar",
]
const parentNames = [
  "Mr. A",
  "Mrs. B",
  "Mr. C",
  "Mrs. D",
  "Mr. E",
  "Mrs. F",
  "Mr. G",
  "Mrs. H",
  "Mr. I",
  "Mrs. J",
  "Mr. K",
  "Mrs. L",
  "Mr. M",
  "Mrs. N",
  "Mr. O",
]
const grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"]
const dashboardStatuses: ("full" | "partial" | "rejected")[] = ["full", "partial", "rejected"]

const additionalDashboardPayments: PaymentData[] = []
for (let i = 0; i < 15; i++) {
  const totalAmount = getRandomInt(10, 29) // Amounts less than MYR 30
  const status = dashboardStatuses[getRandomInt(0, dashboardStatuses.length - 1)]
  let amountPaid
  let remainingAmount

  if (status === "full") {
    amountPaid = totalAmount
    remainingAmount = 0
  } else if (status === "partial") {
    amountPaid = getRandomInt(1, totalAmount - 1)
    remainingAmount = totalAmount - amountPaid
  } else {
    // rejected
    amountPaid = 0
    remainingAmount = totalAmount
  }

  additionalDashboardPayments.push({
    studentName: studentNames[getRandomInt(0, studentNames.length - 1)],
    class: grades[getRandomInt(0, grades.length - 1)],
    parentName: parentNames[getRandomInt(0, parentNames.length - 1)],
    totalAmount: totalAmount,
    amountPaid: amountPaid,
    remainingAmount: remainingAmount,
    status: status,
    date: getRandomDate(30),
  })
}

export const allDashboardPaymentData: PaymentData[] = [...initialDashboardPaymentData, ...additionalDashboardPayments]

// Historical Payments Data
const initialHistoricalPaymentData: HistoricalPaymentData[] = [
  {
    paymentDate: "2023-10-26",
    parentName: "Sophia Clark",
    children: "Liam Clark, Olivia Clark",
    totalAmount: 25.0,
    status: "completed",
    grade: "5",
  },
  {
    paymentDate: "2023-11-01",
    parentName: "John Doe",
    children: "Emily Doe",
    totalAmount: 15.0,
    status: "pending",
    grade: "3",
  },
  {
    paymentDate: "2023-10-20",
    parentName: "Jane Smith",
    children: "Daniel Smith",
    totalAmount: 10.0,
    status: "partial",
    grade: "4",
  },
  {
    paymentDate: "2023-09-10",
    parentName: "Robert Brown",
    children: "Sarah Brown",
    totalAmount: 28.0,
    status: "rejected",
    grade: "2",
  },
  {
    paymentDate: "2023-11-05",
    parentName: "Chris Green",
    children: "Alex Green",
    totalAmount: 5.0,
    status: "rejected",
    grade: "1",
  },
  {
    paymentDate: "2023-10-15",
    parentName: "Jessica White",
    children: "Laura White",
    totalAmount: 20.0,
    status: "rejected",
    grade: "5",
  },
  {
    paymentDate: "2023-11-08",
    parentName: "David Lee",
    children: "Kevin Lee",
    totalAmount: 12.0,
    status: "completed",
    grade: "3",
  },
  {
    paymentDate: "2023-11-10",
    parentName: "Sarah Chen",
    children: "Jason Chen",
    totalAmount: 8.0,
    status: "pending",
    grade: "4",
  },
  {
    paymentDate: "2023-09-20",
    parentName: "Michael Wang",
    children: "Lily Wang",
    totalAmount: 22.0,
    status: "rejected",
    grade: "2",
  },
  {
    paymentDate: "2023-10-01",
    parentName: "Emily Johnson",
    children: "Oliver Johnson",
    totalAmount: 18.0,
    status: "completed",
    grade: "1",
  },
]

const studentFirstNames = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Eve",
  "Frank",
  "Grace",
  "Heidi",
  "Ivan",
  "Judy",
  "Kevin",
  "Linda",
  "Mike",
  "Nancy",
  "Oscar",
]
const studentLastNames = [
  "Smith",
  "Jones",
  "Williams",
  "Brown",
  "Davis",
  "Miller",
  "Wilson",
  "Moore",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
]
const parentFirstNames = [
  "James",
  "Mary",
  "Robert",
  "Patricia",
  "John",
  "Jennifer",
  "Michael",
  "Linda",
  "William",
  "Elizabeth",
  "David",
  "Susan",
  "Richard",
  "Jessica",
  "Joseph",
]
const parentLastNames = [
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
]
const historicalGrades = ["1", "2", "3", "4", "5", "6"]
const historicalStatuses: ("completed" | "pending" | "rejected" | "partial")[] = [
  "completed",
  "pending",
  "rejected",
  "partial",
]

const additionalHistoricalPayments: HistoricalPaymentData[] = []
for (let i = 0; i < 15; i++) {
  const totalAmount = getRandomInt(10, 29) // Amounts less than MYR 30
  const status = historicalStatuses[getRandomInt(0, historicalStatuses.length - 1)]

  const numChildren = getRandomInt(1, 2) // 1 or 2 children
  const childrenNames = []
  for (let j = 0; j < numChildren; j++) {
    childrenNames.push(
      `${studentFirstNames[getRandomInt(0, studentFirstNames.length - 1)]} ${studentLastNames[getRandomInt(0, studentLastNames.length - 1)]}`,
    )
  }

  additionalHistoricalPayments.push({
    paymentDate: getRandomDate(60),
    parentName: `${parentFirstNames[getRandomInt(0, parentFirstNames.length - 1)]} ${parentLastNames[getRandomInt(0, parentLastNames.length - 1)]}`,
    children: childrenNames.join(", "),
    totalAmount: totalAmount,
    status: status,
    grade: historicalGrades[getRandomInt(0, historicalGrades.length - 1)],
  })
}

export const allHistoricalPaymentData: HistoricalPaymentData[] = [
  ...initialHistoricalPaymentData,
  ...additionalHistoricalPayments,
]
