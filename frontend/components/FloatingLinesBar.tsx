"use client";

import type { LineaState } from "@/lib/types";

interface FloatingLinesBarProps {
  lines: LineaState[];
  onClose: () => void;
  onPeak?: (lineId: string, label: string) => void;
  onRefill?: (lineId: string) => void;
  loading?: boolean;
}

function levelColor(pct: number): string {
  if (pct < 25) return "#f87171";
  if (pct < 50) return "#fbbf24";
  return "#34d399";
}

export function FloatingLinesBar({
  lines,
  onClose,
  onPeak,
  onRefill,
  loading,
}: FloatingLinesBarProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-3 sm:p-4">
      <div className="pointer-events-auto nest-panel w-full max-w-4xl border-white/[0.1] bg-[#0d1219]/92 shadow-nest-panel backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] px-3 py-2">
          <div className="nest-label">
            Operaciones de línea · {lines.length}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="nest-btn-ghost nest-btn px-2 py-1 text-sm"
            title="Salir de mapa completo (Esc)"
            aria-label="Cerrar mapa completo"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[28vh] overflow-y-auto px-2 py-2">
          {lines.length === 0 && (
            <p className="px-2 py-1 text-xs text-nest-muted">Sin líneas</p>
          )}
          <ul className="space-y-1">
            {lines.map((line) => {
              const color = levelColor(line.nivel_pct);
              const low = line.nivel_pct < 25;
              return (
                <li
                  key={line.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03]"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      background: color,
                      boxShadow: low ? `0 0 6px ${color}` : undefined,
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate text-sm text-nest-text">
                    {line.nombre}
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold tabular-nums ${
                      low ? "text-red-400" : "text-nest-muted"
                    }`}
                  >
                    {line.nivel_pct.toFixed(0)}%
                  </span>
                  {onPeak && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => onPeak(line.id, line.nombre)}
                      className="nest-btn-warm nest-btn px-2 py-0.5 text-[0.65rem]"
                    >
                      Pico
                    </button>
                  )}
                  {onRefill && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => onRefill(line.id)}
                      className="nest-btn-success nest-btn px-2 py-0.5 text-[0.65rem]"
                    >
                      80%
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
