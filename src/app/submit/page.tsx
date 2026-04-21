import { SubmitForm } from "@/components/SubmitForm";

export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div className="min-w-0">
            <div className="text-base font-semibold text-slate-900">Submit wisdom</div>
            <div className="text-xs text-slate-600">Add a story so others don’t have to suffer alone.</div>
          </div>
          <a
            href="/"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back to map
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <SubmitForm />
      </div>
    </main>
  );
}

