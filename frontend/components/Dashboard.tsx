"use client";

import { useCallback, useState } from "react";
import { ControlPanel } from "@/components/ControlPanel";
import { FleetBatteryPanel } from "@/components/FleetBatteryPanel";
import { FleetDetailView } from "@/components/FleetDetailView";
import { FloatingDetailModal } from "@/components/FloatingDetailModal";
import { Header } from "@/components/Header";
import { KanbanDetailView } from "@/components/KanbanDetailView";
import { KanbanPanel } from "@/components/KanbanPanel";
import { KpiBar } from "@/components/KpiBar";
import { LineGaugesPanel } from "@/components/LineGaugesPanel";
import { NoticeBanner } from "@/components/NoticeBanner";
import { PlantMap } from "@/components/PlantMap";
import { TrendsPanel } from "@/components/TrendsPanel";
import { usePlantLayout } from "@/hooks/usePlantLayout";
import { useLerpAmrs, useSimulation } from "@/hooks/useSimulation";
import { useToast } from "@/hooks/useToast";
import type { KPIsState, SelectedEdge, SpillMode } from "@/lib/types";

const EMPTY_KPIS: KPIsState = {
  viajes_completados: 0,
  viajes_vacios_evitados: 0,
  paradas_evitadas: 0,
  tiempo_medio_entrega_min: 0,
  km_evitados: 0,
  roi_km_pct: 0,
};

export function Dashboard() {
  const { pushToast } = useToast();
  const {
    plants,
    selectedPlantId,
    changePlant,
    layout,
    layoutKey,
    error: layoutError,
    loading: plantLoading,
  } = usePlantLayout();

  const {
    snapshot,
    missions,
    mode,
    blockEdge,
    unblockEdge,
    injectPeak,
    simulateLowBattery,
    refill,
    resetMissions,
    adjustMissions,
  } = useSimulation(layout);

  const renderAmrs = useLerpAmrs(snapshot, layoutKey);

  const [spillMode, setSpillMode] = useState<SpillMode>("none");
  const [selectedEdge, setSelectedEdge] = useState<SelectedEdge | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [lowBatteryLoadingId, setLowBatteryLoadingId] = useState<string | null>(
    null
  );
  const [fleetCollapsed, setFleetCollapsed] = useState(false);
  const [linesCollapsed, setLinesCollapsed] = useState(false);
  const [kanbanCollapsed, setKanbanCollapsed] = useState(false);
  const [fleetModalOpen, setFleetModalOpen] = useState(false);
  const [kanbanModalOpen, setKanbanModalOpen] = useState(false);

  const sidebarNarrow =
    fleetCollapsed && linesCollapsed && kanbanCollapsed ? "72px" : "280px";

  const handleSpillModeChange = (mode: SpillMode) => {
    setSpillMode(mode);
    setSelectedEdge(null);
  };

  const handleConfirmBlock = useCallback(async () => {
    if (!selectedEdge) return;
    setActionLoading(true);
    const label = `${selectedEdge.from}–${selectedEdge.to}`;
    try {
      await blockEdge(selectedEdge.from, selectedEdge.to);
      pushToast(`Derrame bloqueado en ${label}`, "success");
      setSelectedEdge(null);
      setSpillMode("none");
    } catch {
      pushToast(`Error al bloquear ${label}`, "error");
    } finally {
      setActionLoading(false);
    }
  }, [selectedEdge, blockEdge, pushToast]);

  const handleConfirmUnblock = useCallback(async () => {
    if (!selectedEdge) return;
    setActionLoading(true);
    const label = `${selectedEdge.from}–${selectedEdge.to}`;
    try {
      await unblockEdge(selectedEdge.from, selectedEdge.to);
      pushToast(`Pasillo despejado: ${label}`, "success");
      setSelectedEdge(null);
      setSpillMode("none");
    } catch {
      pushToast(`Error al despejar ${label}`, "error");
    } finally {
      setActionLoading(false);
    }
  }, [selectedEdge, unblockEdge, pushToast]);

  const handlePeak = useCallback(
    async (lineId: string, label: string) => {
      setActionLoading(true);
      try {
        await injectPeak(lineId);
        pushToast(`Pico de demanda en ${label}`, "success");
      } catch {
        pushToast(`Error al inyectar pico en ${label}`, "error");
      } finally {
        setActionLoading(false);
      }
    },
    [injectPeak, pushToast]
  );

  const handleRefill = useCallback(
    async (lineId?: string | null) => {
      setActionLoading(true);
      try {
        const result = await refill(lineId, 80);
        const scheduled = result?.lines ?? [];
        const label =
          scheduled.length > 0
            ? scheduled.join(", ")
            : lineId ?? "empacadoras";
        pushToast(`⌛ Metas >80% fijadas: ${label}`, "success");
      } catch {
        pushToast("Error al programar refill", "error");
      } finally {
        setActionLoading(false);
      }
    },
    [refill, pushToast]
  );

  const handleResetMissions = useCallback(async () => {
    setActionLoading(true);
    try {
      const result = await resetMissions();
      const activas = Array.isArray(result.activas) ? result.activas.length : (result.activas ?? 0);
      pushToast(
        `Misiones reiniciadas (${activas} activas)`,
        "success"
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("Solo disponible con backend")) {
        pushToast("Solo disponible con backend", "info");
      } else {
        pushToast("Error al reiniciar misiones", "error");
      }
    } finally {
      setActionLoading(false);
    }
  }, [resetMissions, pushToast]);

  const handleAdjustMissions = useCallback(
    async (delta: number) => {
      setActionLoading(true);
      try {
        const result = await adjustMissions(delta);
        const sign = delta > 0 ? `+${delta}` : `${delta}`;
        const action = delta > 0 ? "encoladas" : "";
        pushToast(
          `${sign} misiones${action ? ` ${action}` : ""} (${result.pendientes} pendientes)`,
          "success"
        );
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        if (msg.includes("Solo disponible con backend")) {
          pushToast("Solo disponible con backend", "info");
        } else {
          pushToast("Error al ajustar misiones", "error");
        }
      } finally {
        setActionLoading(false);
      }
    },
    [adjustMissions, pushToast]
  );

  const handleLowBattery = useCallback(
    async (amrId: string, nombre: string) => {
      setLowBatteryLoadingId(amrId);
      try {
        await simulateLowBattery(amrId);
        pushToast(`${nombre}: batería simulada al 15% → recarga`, "success");
      } catch {
        pushToast(`Error al simular batería baja en ${nombre}`, "error");
      } finally {
        setLowBatteryLoadingId(null);
      }
    },
    [simulateLowBattery, pushToast]
  );

  const handlePlantChange = useCallback(
    async (plantId: string) => {
      pushToast(`Cambiando a planta ${plantId}…`, "info");
      try {
        await changePlant(plantId);
        setSelectedEdge(null);
        setSpillMode("none");
        pushToast(
          `Planta activa: ${plants.find((p) => p.id === plantId)?.nombre ?? plantId}`,
          "success"
        );
      } catch {
        pushToast("Error al cambiar planta", "error");
      }
    },
    [changePlant, plants, pushToast]
  );

  if (layoutError && !layout) {
    return (
      <div className="p-8 text-red-400">
        Error cargando layout: {layoutError}
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="nest-shell flex h-screen flex-col items-center justify-center gap-3 text-nest-muted">
        <div
          className="h-8 w-8 rounded-full border-2 border-white/[0.08] border-t-nest-accent animate-spin"
          aria-hidden
        />
        <p className="text-sm">Cargando mapa de planta…</p>
      </div>
    );
  }

  const kpis = snapshot?.kpis ?? EMPTY_KPIS;
  const lines = snapshot?.lines ?? [];
  const obstacles = snapshot?.obstacles ?? [];
  const notices = snapshot?.notices ?? [];
  const fleetAmrs = snapshot?.amrs ?? [];

  return (
    <div className="nest-shell flex h-screen flex-col text-nest-text">
      <Header
        simTime={snapshot?.sim_time}
        amrCount={renderAmrs.length}
        mode={mode}
        plants={plants}
        selectedPlantId={selectedPlantId}
        onPlantChange={handlePlantChange}
        plantLoading={plantLoading}
      />
      <NoticeBanner notices={notices} />
      <div
        className="dashboard-grid grid flex-1 gap-3 p-4 min-h-0 transition-[grid-template-columns] duration-300"
        style={{
          gridTemplateColumns: `1fr ${sidebarNarrow}`,
          gridTemplateRows: "minmax(0, 1fr) auto",
        }}
      >
        <div className="flex flex-col gap-2 min-h-0 min-w-0">
          <ControlPanel
            spillMode={spillMode}
            onSpillModeChange={handleSpillModeChange}
            selectedEdge={selectedEdge}
            onConfirmBlock={handleConfirmBlock}
            onConfirmUnblock={handleConfirmUnblock}
            lines={lines}
            onPeak={handlePeak}
            onRefill={(lineId) => handleRefill(lineId)}
            onRefillAll={() => handleRefill(null)}
            onResetMissions={handleResetMissions}
            onAdjustMissions={handleAdjustMissions}
            offline={mode === "offline"}
            loading={actionLoading}
          />
          <div className="nest-panel flex-1 min-h-[280px] overflow-hidden shadow-nest-glow">
            <PlantMap
              layout={layout}
              layoutKey={layoutKey}
              amrs={renderAmrs}
              missions={missions}
              obstacles={obstacles}
              spillMode={spillMode}
              selectedEdge={selectedEdge}
              onEdgeSelect={setSelectedEdge}
            />
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-col gap-2 overflow-hidden">
          <FleetBatteryPanel
            amrs={fleetAmrs}
            onLowBattery={handleLowBattery}
            loadingId={lowBatteryLoadingId}
            collapsed={fleetCollapsed}
            onToggle={() => setFleetCollapsed((c) => !c)}
            onExpand={() => setFleetModalOpen(true)}
          />
          <LineGaugesPanel
            lines={lines}
            collapsed={linesCollapsed}
            onToggle={() => setLinesCollapsed((c) => !c)}
          />
          <KanbanPanel
            missions={missions}
            collapsed={kanbanCollapsed}
            onToggle={() => setKanbanCollapsed((c) => !c)}
            onExpand={() => setKanbanModalOpen(true)}
          />
          {!fleetCollapsed && !linesCollapsed && !kanbanCollapsed && (
            <div className="shrink-0">
              <TrendsPanel />
            </div>
          )}
        </div>

        <div className="col-span-2 min-w-0">
          <KpiBar kpis={kpis} />
        </div>
      </div>

      <FloatingDetailModal
        title="Flota — Vista detallada"
        open={fleetModalOpen}
        onClose={() => setFleetModalOpen(false)}
      >
        <FleetDetailView
          amrs={fleetAmrs}
          layout={layout}
          onLowBattery={handleLowBattery}
          loadingId={lowBatteryLoadingId}
        />
      </FloatingDetailModal>

      <FloatingDetailModal
        title="Kanban — Vista detallada"
        open={kanbanModalOpen}
        onClose={() => setKanbanModalOpen(false)}
      >
        <KanbanDetailView missions={missions} />
      </FloatingDetailModal>
    </div>
  );
}
