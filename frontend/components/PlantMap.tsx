"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AMR_STATE_COLORS, getAmrColor } from "@/lib/amrColors";
import { getBatteryEmoji, resolveAmrCargoVisual } from "@/lib/amrCargo";
import { edgeKey, findEdgeAtScreenPoint } from "@/lib/edgeHit";
import { getAmrAnchor } from "@/lib/mapGeometry";
import { getLayoutBounds, type LayoutBounds } from "@/lib/layoutBounds";
import type {
  AMRRenderState,
  LayoutEdge,
  Mission,
  ObstaculoState,
  PlantLayout,
  SelectedEdge,
  SpillMode,
} from "@/lib/types";

interface PlantMapProps {
  layout: PlantLayout;
  layoutKey: number;
  amrs: AMRRenderState[];
  missions?: Mission[];
  obstacles: ObstaculoState[];
  spillMode: SpillMode;
  selectedEdge: SelectedEdge | null;
  onEdgeSelect: (edge: SelectedEdge | null) => void;
}

export function PlantMap({
  layout,
  layoutKey,
  amrs,
  missions = [],
  obstacles,
  spillMode,
  selectedEdge,
  onEdgeSelect,
}: PlantMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const transformRef = useRef({ scale: 1, offsetX: 0, offsetY: 0 });
  const boundsRef = useRef<LayoutBounds>(getLayoutBounds(layout));
  const [hoveredEdge, setHoveredEdge] = useState<SelectedEdge | null>(null);
  const hoveredRef = useRef<SelectedEdge | null>(null);
  const [mapOpacity, setMapOpacity] = useState(1);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const panel = canvas.parentElement;
    if (!panel) return;

    canvas.width = panel.clientWidth;
    canvas.height = panel.clientHeight;

    const bounds = getLayoutBounds(layout);
    boundsRef.current = bounds;

    const pad = 40;
    const scale = Math.min(
      (canvas.width - pad * 2) / bounds.width,
      (canvas.height - pad * 2) / bounds.height
    );

    transformRef.current = {
      scale,
      offsetX: (canvas.width - bounds.width * scale) / 2 - bounds.minX * scale,
      offsetY: (canvas.height - bounds.height * scale) / 2 - bounds.minY * scale,
    };
  }, [layout]);

  useEffect(() => {
    setMapOpacity(0.35);
    resize();
    const t = window.setTimeout(() => setMapOpacity(1), 120);
    return () => window.clearTimeout(t);
  }, [layout, layoutKey, resize]);

  const toScreen = (x: number, y: number) => {
    const { scale, offsetX, offsetY } = transformRef.current;
    // Medio píxel para trazos nítidos y centrados sobre la centerline
    const sx = offsetX + x * scale;
    const sy = offsetY + y * scale;
    return { x: Math.round(sx * 2) / 2, y: Math.round(sy * 2) / 2 };
  };

  const toLayout = (sx: number, sy: number) => {
    const { scale, offsetX, offsetY } = transformRef.current;
    return {
      x: (sx - offsetX) / scale,
      y: (sy - offsetY) / scale,
    };
  };

  const getBlockedEdges = useCallback(() => {
    const blocked = new Set<string>();
    obstacles.forEach((o) => {
      if (o.edge) blocked.add(edgeKey(o.edge[0], o.edge[1]));
    });
    layout.edges.forEach((e) => {
      if (e.blocked) blocked.add(edgeKey(e.from, e.to));
    });
    return blocked;
  }, [obstacles, layout.edges]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { scale, offsetX, offsetY } = transformRef.current;
    const bounds = boundsRef.current;
    const blockedEdges = getBlockedEdges();
    const hover = hoveredRef.current;
    const sel = selectedEdge;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bgX = offsetX + bounds.minX * scale;
    const bgY = offsetY + bounds.minY * scale;
    const bgW = bounds.width * scale;
    const bgH = bounds.height * scale;

    ctx.fillStyle = "#e8f4fc";
    ctx.fillRect(bgX, bgY, bgW, bgH);

    ctx.strokeStyle = "#c5dce8";
    ctx.lineWidth = 0.5;
    const gridStep = 40;
    for (
      let x = Math.floor(bounds.minX / gridStep) * gridStep;
      x <= bounds.maxX;
      x += gridStep
    ) {
      const s = toScreen(x, bounds.minY);
      ctx.beginPath();
      ctx.moveTo(s.x, bgY);
      ctx.lineTo(s.x, bgY + bgH);
      ctx.stroke();
    }
    for (
      let y = Math.floor(bounds.minY / gridStep) * gridStep;
      y <= bounds.maxY;
      y += gridStep
    ) {
      const s = toScreen(bounds.minX, y);
      ctx.beginPath();
      ctx.moveTo(bgX, s.y);
      ctx.lineTo(bgX + bgW, s.y);
      ctx.stroke();
    }

    layout.edges.forEach((e: LayoutEdge) => {
      const na = layout.nodes.find((n) => n.id === e.from);
      const nb = layout.nodes.find((n) => n.id === e.to);
      if (!na || !nb) return;
      const sa = toScreen(na.x, na.y);
      const sb = toScreen(nb.x, nb.y);
      const key = edgeKey(e.from, e.to);
      const blocked = blockedEdges.has(key);
      const isHover = hover && edgeKey(hover.from, hover.to) === key;
      const isSel = sel && edgeKey(sel.from, sel.to) === key;

      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);

      if (blocked) {
        ctx.strokeStyle = "#f85149";
        ctx.lineWidth = (isHover || isSel ? 6 : 4) * scale;
        ctx.setLineDash([6, 4]);
      } else if (isSel) {
        ctx.strokeStyle = "#58a6ff";
        ctx.lineWidth = 6 * scale;
        ctx.setLineDash([]);
      } else if (isHover) {
        ctx.strokeStyle = "#db6d28";
        ctx.lineWidth = 5 * scale;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = "#4a90b8";
        ctx.lineWidth = 3 * scale;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      if (blocked) {
        const mx = (sa.x + sb.x) / 2;
        const my = (sa.y + sb.y) / 2;
        ctx.font = `${14 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("🚧", mx, my);
      }

      if (isSel && !blocked) {
        const mx = (sa.x + sb.x) / 2;
        const my = (sa.y + sb.y) / 2;
        ctx.fillStyle = "#58a6ff";
        ctx.font = `bold ${9 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(`${e.from}→${e.to}`, mx, my - 8 * scale);
      }
    });

    layout.nodes.forEach((n) => {
      const s = toScreen(n.x, n.y);
      if (n.type === "linea") {
        ctx.fillStyle = "#2d6a4f";
        ctx.fillRect(s.x - 20 * scale, s.y - 12 * scale, 40 * scale, 24 * scale);
      } else if (n.type === "empacadora") {
        ctx.fillStyle = "#e85d04";
        ctx.fillRect(s.x - 20 * scale, s.y - 12 * scale, 40 * scale, 24 * scale);
      } else if (n.type === "almacen") {
        ctx.fillStyle = "#457b9d";
        ctx.fillRect(s.x - 22 * scale, s.y - 16 * scale, 44 * scale, 32 * scale);
        ctx.strokeStyle = "#a8dadc";
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(s.x - 18 * scale, s.y - 12 * scale + i * 10 * scale);
          ctx.lineTo(s.x + 18 * scale, s.y - 12 * scale + i * 10 * scale);
          ctx.stroke();
        }
      } else if (n.type === "carga") {
        ctx.fillStyle = "#d29922";
        ctx.beginPath();
        ctx.arc(s.x, s.y, 12 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = `${10 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText("⚡", s.x, s.y + 4 * scale);
      } else {
        ctx.fillStyle = "#6c8ebf";
        ctx.beginPath();
        ctx.arc(s.x, s.y, 6 * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      if (n.label && n.type !== "cruce") {
        ctx.fillStyle = "#1a3a4a";
        ctx.font = `bold ${9 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(n.label, s.x, s.y - 18 * scale);
      } else if (n.type === "cruce") {
        ctx.fillStyle = "#4a6a7a";
        ctx.font = `${7 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(n.id, s.x, s.y + 14 * scale);
      }
    });

    obstacles
      .filter((o) => o.tipo === "OPERATOR")
      .forEach((p) => {
        const s = toScreen(p.x, p.y);
        const rad = p.radius * 4 * scale;
        ctx.beginPath();
        ctx.arc(s.x, s.y, rad, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(219, 110, 40, 0.15)";
        ctx.fill();
        ctx.strokeStyle = "rgba(219, 110, 40, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#db6d28";
        ctx.beginPath();
        ctx.arc(s.x, s.y, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = `${8 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🚶", s.x, s.y);
      });

    // Rutas y AMRs — join misión por id (tarea_asignada es string) + fallback path
    const missionById = new Map(missions.map((m) => [m.id, m]));

    amrs.forEach((amr) => {
      try {
        if (amr.path.length < 1) return;
        const { routeColor } = resolveAmrCargoVisual(amr, layout, missionById);
        const isMoving =
          amr.estado === "MOVING_TO_PICKUP" ||
          amr.estado === "MOVING_TO_DELIVERY";
        const isWaiting = amr.estado === "WAITING_OBSTACLE";
        const speed = isMoving ? 2 : isWaiting ? 0.5 : 0;
        const dashOffset = speed ? (Date.now() * speed * 0.02) % 20 : 0;

        const anchor = getAmrAnchor(amr, layout);

        ctx.save();
        ctx.strokeStyle = routeColor;
        ctx.lineWidth = 2 * scale;
        ctx.globalAlpha = 0.55;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -dashOffset;
        const start = toScreen(anchor.x, anchor.y);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        amr.path.forEach((nid) => {
          const n = layout.nodes.find((x) => x.id === nid);
          if (!n) return;
          const s2 = toScreen(n.x, n.y);
          ctx.lineTo(s2.x, s2.y);
        });
        ctx.stroke();
        ctx.restore();
      } catch {
        // No tumbar el bucle de dibujo por un AMR con datos incompletos
      }
    });

    amrs.forEach((amr, i) => {
      try {
        const anchor = getAmrAnchor(amr, layout);
        const s = toScreen(anchor.x, anchor.y);
        const ring = AMR_STATE_COLORS[amr.estado] ?? "#8b949e";
        const { cargoEmoji } = resolveAmrCargoVisual(amr, layout, missionById);

        ctx.beginPath();
        ctx.arc(s.x, s.y, 16 * scale, 0, Math.PI * 2);
        ctx.strokeStyle = ring;
        ctx.lineWidth = 3 * scale;
        ctx.stroke();

        ctx.fillStyle = getAmrColor(i);
        const w = 20 * scale;
        const h = 16 * scale;
        ctx.beginPath();
        ctx.roundRect(s.x - w / 2, s.y - h / 2, w, h, 4 * scale);
        ctx.fill();

        ctx.fillStyle = "#1a1a2e";
        ctx.font = `bold ${8 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(amr.nombre.split(" ")[0], s.x, s.y - 22 * scale);

        ctx.font = `${11 * scale}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${cargoEmoji} ${getBatteryEmoji(amr)}`, s.x, s.y - 30 * scale);

        const bw = 24 * scale;
        ctx.fillStyle = "#30363d";
        ctx.fillRect(s.x - bw / 2, s.y + 12 * scale, bw, 4 * scale);
        ctx.fillStyle = amr.bateria > 30 ? "#3fb950" : "#f85149";
        ctx.fillRect(
          s.x - bw / 2,
          s.y + 12 * scale,
          bw * (amr.bateria / 100),
          4 * scale
        );
      } catch {
        // Saltar AMR problemático; el resto sigue visible
      }
    });
  }, [layout, amrs, missions, obstacles, spillMode, selectedEdge, getBlockedEdges]);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  useEffect(() => {
    let id = 0;
    const loop = () => {
      draw();
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  const handlePointer = (
    clientX: number,
    clientY: number,
    isClick: boolean
  ) => {
    if (spillMode === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    const sx = (clientX - rect.left) * scaleX;
    const sy = (clientY - rect.top) * scaleY;
    const hit = findEdgeAtScreenPoint(layout, sx, sy, toScreen, 18);

    if (!hit) {
      if (isClick) onEdgeSelect(null);
      hoveredRef.current = null;
      setHoveredEdge(null);
      return;
    }

    const blockedEdges = getBlockedEdges();
    const key = edgeKey(hit.from, hit.to);
    const isBlocked = blockedEdges.has(key);

    if (spillMode === "block" && isBlocked) {
      if (isClick) onEdgeSelect(null);
      hoveredRef.current = null;
      setHoveredEdge(null);
      return;
    }
    if (spillMode === "unblock" && !isBlocked) {
      if (isClick) onEdgeSelect(null);
      hoveredRef.current = null;
      setHoveredEdge(null);
      return;
    }

    const edge = { from: hit.from, to: hit.to };
    hoveredRef.current = edge;
    setHoveredEdge(edge);
    if (isClick) onEdgeSelect(edge);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (spillMode === "none") {
      hoveredRef.current = null;
      setHoveredEdge(null);
      return;
    }
    handlePointer(e.clientX, e.clientY, false);
  };

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (spillMode === "none") return;
    handlePointer(e.clientX, e.clientY, true);
  };

  const onMouseLeave = () => {
    hoveredRef.current = null;
    setHoveredEdge(null);
  };

  const cursor =
    spillMode !== "none"
      ? hoveredEdge
        ? "pointer"
        : "crosshair"
      : "default";

  return (
    <canvas
      ref={canvasRef}
      className="block w-full h-full transition-opacity duration-300 ease-out"
      style={{ cursor, opacity: mapOpacity }}
      aria-label="Mapa 2D de planta NestLink"
      onMouseMove={onMouseMove}
      onClick={onClick}
      onMouseLeave={onMouseLeave}
    />
  );
}
