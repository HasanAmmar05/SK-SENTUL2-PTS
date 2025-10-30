import * as React from "react";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm p-4 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
