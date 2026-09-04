"use client";

import { useToast } from "@/hooks/useToast";

export function ToastStack() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-nest-panel backdrop-blur-xl animate-in slide-in-from-right ${
            t.type === "error"
              ? "border-red-500/40 bg-red-950/85 text-red-100"
              : t.type === "success"
                ? "border-emerald-500/35 bg-emerald-950/80 text-emerald-100"
                : "border-white/[0.1] bg-[#111820]/95 text-nest-text"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <span className="leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="shrink-0 rounded-md p-0.5 text-nest-muted hover:bg-white/[0.06] hover:text-nest-text text-xs"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
