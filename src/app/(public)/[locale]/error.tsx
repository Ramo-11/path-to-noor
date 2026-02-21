"use client";

import { useEffect } from "react";
import { Container } from "@/components/layout/Container";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="py-24 sm:py-32">
      <Container size="sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-6">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white">
            Something went wrong
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            An unexpected error occurred. Please try again.
          </p>
          <div className="mt-8">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
