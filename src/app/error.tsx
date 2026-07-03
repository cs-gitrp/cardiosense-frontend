"use client";
import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Prognosis error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
      
      {/* Icon block */}
      <div className="relative w-16 h-16 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center text-risk-high shadow-lg">
        <AlertCircle size={28} />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="font-display text-2xl text-text">Pipeline Execution Anomaly</h2>
        <p className="text-xs text-text-muted leading-relaxed">
          An unexpected error occurred during classification. This could be due to missing structured features or noisy signal feeds.
        </p>
        {error.message && (
          <p className="p-2.5 bg-surface-2 border border-border rounded-xl font-mono text-[10px] text-text-subtle mt-2 truncate">
            Details: {error.message}
          </p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={() => reset()}
          className="px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-accent/90 shadow-md shadow-rose-600/5 transition-all flex items-center gap-1.5"
        >
          <RefreshCw size={13} />
          Retry Pipeline
        </button>
        
        <Link 
          href="/"
          className="px-4 py-2.5 rounded-xl border border-border bg-white text-xs font-semibold text-text hover:bg-surface-2 transition-colors flex items-center gap-1.5"
        >
          <Home size={13} />
          Dashboard
        </Link>
      </div>

    </div>
  );
}
