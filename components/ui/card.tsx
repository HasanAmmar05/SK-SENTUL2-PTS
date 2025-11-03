import * as React from "react";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-3xl shadow-sm p-4 overflow-hidden ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
