interface MainFooterProps {
  userType: "parent" | "treasurer" | "teacher" // Add 'teacher'
  activePath?: string
}

export function MainFooter({ userType, activePath }: MainFooterProps) {
  const borderColor =
    userType === "treasurer" && activePath === "/treasurer/login"
      ? "border-[var(--border-color-treasurer-login)]"
      : userType === "treasurer" && activePath === "/treasurer/payment-details"
        ? "border-[var(--border-color-treasurer-details)]"
        : userType === "parent" && activePath === "/parent/dashboard"
          ? "border-[var(--border-color-parent-info)]"
          : userType === "treasurer" && activePath === "/treasurer/pending-payments"
            ? "border-[var(--border-light-treasurer-pending)]"
            : userType === "treasurer" && activePath === "/treasurer/historical-payments"
              ? "border-[var(--border-color-historical)]"
              : userType === "teacher"
                ? "border-[var(--border-color-teacher)]" // Teacher specific color
                : "border-slate-200" // Default

  const textColor =
    userType === "treasurer" && activePath === "/treasurer/login"
      ? "text-[var(--muted-text-color-treasurer-login)]"
      : userType === "treasurer" && activePath === "/treasurer/payment-details"
        ? "text-[var(--text-secondary-treasurer-details)]"
        : userType === "parent" && activePath === "/parent/dashboard"
          ? "text-[var(--text-secondary-parent-info)]"
          : userType === "treasurer" && activePath === "/treasurer/pending-payments"
            ? "text-[var(--text-secondary-treasurer-pending)]"
            : userType === "treasurer" && activePath === "/treasurer/historical-payments"
              ? "text-[var(--text-secondary-historical)]"
              : userType === "teacher"
                ? "text-[var(--text-secondary-teacher)]" // Teacher specific color
                : "text-slate-600" // Default

  const bgColor =
    userType === "parent" && activePath === "/parent/dashboard"
      ? "bg-white"
      : userType === "treasurer" && activePath === "/treasurer/historical-payments"
        ? "bg-[var(--card-background-color-historical)]"
        : userType === "teacher"
          ? "bg-[var(--background-color-teacher)]" // Teacher specific color
          : "" // Default, often handled by body background

  const paddingX = userType === "treasurer" && activePath === "/treasurer/payment-details" ? "px-10" : ""

  return (
    <footer className={`py-6 text-center border-t ${borderColor} ${bgColor} ${paddingX}`}>
      <p className={`text-sm ${textColor}`}>© {new Date().getFullYear()} SK SENTUL 2. All rights reserved.</p>
    </footer>
  )
}
