import { SubmitForm } from "@/components/SubmitForm";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">Share your wisdom...</div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Add a story so others don’t have to suffer alone.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              Back to map
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <SubmitForm />
      </div>
    </main>
  );
}

