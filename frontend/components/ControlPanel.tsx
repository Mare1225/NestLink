"use client";

import { useEffect, useState } from "react";
import type { LineaState, SelectedEdge, SpillMode } from "@/lib/types";

interface ControlPanelProps {
  spillMode: SpillMode;
  onSpillModeChange: (mode: SpillMode) => void;
  selectedEdge: SelectedEdge | null;
  onConfirmBlock: () => Promise<void>;
  onConfirmUnblock: () => Promise<void>;
  lines: LineaState[];
  onPeak: (lineId: string, label: string) => Promise<void>;
  onRefill: (lineId: string) => Promise<void>;
  onRefillAll: () => Promise<void>;
  onResetMissions: () => Promise<void>;
  onAdjustMissions: (delta: number) => Promise<void>;
  offline: boolean;
  loading: boolean;
}

export function ControlPanel({
  spillMode,
  onSpillModeChange,
  selectedEdge,
  onConfirmBlock,
  onConfirmUnblock,
  lines,
  onPeak,
  onRefill,
  onRefillAll,
  onResetMissions,
  onAdjustMissions,
  offline,
  loading,
}: ControlPanelProps) {
  const [peakLineId, setPeakLineId] = useState("");
  const packingLines = lines.filter(
    (l) => l.is_packing ?? l.id.startsWith("E")
  );

  useEffect(() => {
    if (packingLines.length && !peakLineId) {
      setPeakLineId(packingLines[0].id);
    }
    if (packingLines.length && !packingLines.some((l) => l.id === peakLineId)) {
      setPeakLineId(packingLines[0].id);
    }
  }, [packingLines, peakLineId]);

  const toggleMode = (mode: SpillMode) => {
    if (spillMode === mode) onSpillModeChange("none");
    else onSpillModeChange(mode);
  };

  const selectedLine = packingLines.find((l) => l.id === peakLineId);

  return (
    <div className="nest-panel shrink-0 p-3 space-y-3">
      <div className="nest-label">Operaciones de simulación</div>

      <div className="flex flex-col gap-2">
        <div className="nest-toolbar-solid">
          <span className="nest-label shrink-0 px-1">Obstáculos</span>
          <button
            type="button"
            onClick={() => toggleMode("block")}
            className={`nest-btn ${
              spillMode === "block" ? "nest-btn-warm" : "nest-btn-ghost"
            }`}
          >
            Derrame
          </button>
          <button
            type="button"
            onClick={() => toggleMode("unblock")}
            className={`nest-btn ${
              spillMode === "unblock" ? "nest-btn-primary" : "nest-btn-ghost"
            }`}
          >
            Despeje
          </button>
        </div>

        {packingLines.length > 0 && (
          <div className="nest-toolbar-solid flex-col items-stretch gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="nest-label shrink-0">Línea</span>
              <select
                value={peakLineId}
                onChange={(e) => setPeakLineId(e.target.value)}
                className="nest-select min-w-[140px] text-xs py-1"
                aria-label="Línea de producción"
              >
                {packingLines.map((l) => (
                  <option key={l.id} value={l.id} className="bg-[#111820]">
                    {l.nombre}
                  </option>
                ))}
              </select>
              {offline && (
                <span className="nest-status-offline ml-auto">Sin backend</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={loading || !peakLineId}
                onClick={() =>
                  onPeak(peakLineId, selectedLine?.nombre ?? peakLineId)
                }
                className="nest-btn-warm"
              >
                Pico demanda
              </button>
              <button
                type="button"
                disabled={loading || !peakLineId}
                onClick={() => onRefill(peakLineId)}
                className="nest-btn-success"
              >
                Rellenar 80%
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => onRefillAll()}
                className="nest-btn-ghost"
              >
                Todas 80%
              </button>
              <span className="hidden sm:inline h-5 w-px bg-white/[0.1] mx-0.5" aria-hidden />
              <button
                type="button"
                disabled={loading}
                onClick={() => onResetMissions()}
                className="nest-btn-ghost"
              >
                Reiniciar tareas
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => onAdjustMissions(5)}
                className="nest-btn-success"
              >
                +5 misiones
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => onAdjustMissions(-5)}
                className="nest-btn-warning"
              >
                −5 misiones
              </button>
            </div>
          </div>
        )}
      </div>

      {spillMode === "block" && (
        <div className="nest-hint nest-hint-warm text-xs">
          <span>Selecciona un pasillo en el mapa</span>
          {selectedEdge && (
            <>
              <span className="font-mono text-orange-100">
                {selectedEdge.from} → {selectedEdge.to}
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={() => onConfirmBlock()}
                className="nest-btn-danger"
              >
                Confirmar
              </button>
            </>
          )}
        </div>
      )}

      {spillMode === "unblock" && (
        <div className="nest-hint nest-hint-info text-xs">
          <span>Clic en pasillo bloqueado (rojo)</span>
          {selectedEdge && (
            <>
              <span className="font-mono text-sky-100">
                {selectedEdge.from} → {selectedEdge.to}
              </span>
              <button
                type="button"
                disabled={loading}
                onClick={() => onConfirmUnblock()}
                className="nest-btn-primary"
              >
                Confirmar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
