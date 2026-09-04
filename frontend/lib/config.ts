/**
 * Configuración centralizada del frontend NestLink.
 *
 * NEXT_PUBLIC_* se incrusta en el bundle en BUILD (ver Dockerfile ARG).
 * Si la variable no está definida en el entorno de build, usamos localhost.
 */
const DEFAULT_API = "http://localhost:8000";

/** Subpath de despliegue estático (GitHub Pages). Override: NEXT_PUBLIC_BASE_PATH (ej. "/NestLink").
 *  Vacío en Docker/live → todas las rutas locales quedan en la raíz. */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").trim();

/** true cuando el bundle es para un despliegue estático (Pages): no hay backend →
 *  el front entra directo en modo offline (DemoEngine), sin esperar health-check. */
export const IS_STATIC_PAGES = BASE_PATH.length > 0;

/** URL base del backend FastAPI (REST). Override: NEXT_PUBLIC_API_URL */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API;

/** WebSocket de telemetría. Override: NEXT_PUBLIC_WS_URL */
export const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL?.trim() ||
  API_BASE.replace(/^http/, "ws") + "/ws";

export const BACKEND_TIMEOUT_MS = 1500;

/**
 * Fallbacks locales por planta (modo offline/estático; mismo esquema que el backend).
 * realistic_layout.json se genera desde la respuesta real de /api/v1/layout?plant=realistic.
 * Se prefijan con BASE_PATH en runtime para que en Pages cargue /NestLink/maps/... y en
 * local/raíz siga siendo /maps/... (docker/live: BASE_PATH="").
 */
export const LAYOUT_FALLBACK_PATHS: Record<string, string> = {
  quito: `${BASE_PATH}/maps/plant_layout.json`,
  realistic: `${BASE_PATH}/maps/realistic_layout.json`,
};

export const DEFAULT_PLANT_ID = "realistic";
export const DEFAULT_PLANT_NAME = "Planta Realistic";

export const CANVAS_W = 800;
export const CANVAS_H = 500;
