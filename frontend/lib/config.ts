/**
 * Configuración centralizada del frontend NestLink.
 *
 * NEXT_PUBLIC_* se incrusta en el bundle en BUILD (ver Dockerfile ARG).
 * Si la variable no está definida en el entorno de build, usamos localhost.
 */
const DEFAULT_API = "http://localhost:8000";

/** URL base del backend FastAPI (REST). Override: NEXT_PUBLIC_API_URL */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API;

/** WebSocket de telemetría. Override: NEXT_PUBLIC_WS_URL */
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL?.trim() ||
  API_BASE.replace(/^http/, "ws") + "/ws";

export const BACKEND_TIMEOUT_MS = 3000;

export const LAYOUT_FALLBACK_PATH = "/maps/plant_layout.json";

export const DEFAULT_PLANT_ID = "quito";

export const CANVAS_W = 800;
export const CANVAS_H = 500;
