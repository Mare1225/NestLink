"use client";

import type { KPIsState } from "@/lib/types";

interface KpiMiniPanelProps {
  kpis: KPIsState;
}

export function KpiMiniPanel({ kpis }: KpiMiniPanelProps) {
  const items = [
    {
      label: "Viajes",
      value: String(kpis.viajes_completados),
      accent: "text-sky-300",
    },
    {
      label: "Vacíos evit.",
      value: String(kpis.viajes_vacios_evitados),
      accent: "text-violet-300",
    },
    {
      label: "Paradas",
      value: String(kpis.paradas_evitadas),
      accent: "text-amber-300",
    },
    {
      label: "T. medio",
      value: `${kpis.tiempo_medio_entrega_min.toFixed(1)}m`,
      accent: "text-nest-text",
    },
    {
      label: "km evit.",
      value: kpis.km_evitados.toFixed(1),
      accent: "text-sky-200",
    },
    {
      label: "ROI km",
      value: `−${kpis.roi_km_pct}%`,
      accent: "text-emerald-400",
      highlight: true,
    },
  ];

  return (
    <div className="nest-panel shrink-0 p-2">
      <div className="nest-label mb-1.5 px-1">KPIs</div>
      <div className="grid grid-cols-3 gap-1.5">
        {items.map((item) => (
          <div
            key={item.label}
            className={`nest-card px-1.5 py-1.5 text-center ${
              item.highlight ? "border-emerald-500/20 bg-emerald-500/[0.06]" : ""
            }`}
          >
            <div
              className={`font-mono text-xs font-semibold tabular-nums leading-tight ${item.accent}`}
            >
              {item.value}
            </div>
            <div className="mt-0.5 text-[0.55rem] leading-tight text-nest-muted truncate">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
