"use client";

import { useState } from "react";
import { migrateClasses } from "@/app/admin/migration-actions";
import { Button } from "@/components/ui/button";

export default function MigratePage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleMigration = async () => {
    if (!confirm("Are you sure you want to migrate classes? This will update teachers, students, and payments.")) return;

    setLoading(true);
    setLogs([]);
    setError("");

    try {
      const result = await migrateClasses();
      if (result.success) {
        setLogs(result.logs || ["Success!"]);
      } else {
        setError(result.error || "Unknown error");
        setLogs(result.logs || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Migration: Class Names</h1>
      <p className="mb-6 text-slate-600">
        This tool will migrate:
        <ul className="list-disc ml-6 mt-2">
          <li>Teacher Assignments (1A -> 1 Merbau, etc.)</li>
          <li>Class Account Emails (class1a@... -> class1merbau@...)</li>
          <li>Student Grades (1 -> 1 Merbau, etc.)</li>
          <li>Payment Records</li>
        </ul>
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="mb-6">
        <Button onClick={handleMigration} disabled={loading}>
          {loading ? "Migrating..." : "Run Migration"}
        </Button>
      </div>

      <div className="bg-slate-100 p-4 rounded h-96 overflow-auto font-mono text-sm">
        {logs.length === 0 ? (
          <span className="text-slate-400">Logs will appear here...</span>
        ) : (
          logs.map((log, i) => <div key={i}>{log}</div>)
        )}
      </div>
    </div>
  );
}
