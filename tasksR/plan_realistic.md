# 📋 Plan: mapa "realistic" (dibujado a mano) + nueva ronda de cambios

> Estado: **DRAFT** — a la espera de la imagen del mapa que el usuario proporcionará.
> Se marca ✅ cada ítem al completarse. Este archivo es el coordinador de la ronda (lead: Aion CLI).

## 0) Cambios de fondo (ya autorizados, pueden arrancar ya)

- [ ] **Branding Nestlé — Rojo + Blanco** (frontend · dueño: **Cursor**)
  - Convertir el tema oscuro actual (tokens `--nest-*` en `frontend/app/globals.css`, `tailwind.config.ts`, hardcodes `#0d1219`/`#111820`/`border-white/…`) a un tema de marca: superficies BLANCO + acentos ROJO Nestlé (familia `#E4032E`/`#D6001C`).
  - Incluye: Header/logo, badges, botones, paneles, tarjetas, barra flotante, toasts, modales, controles. Mantener el MAPA tipo blueprint (Canvas) intacto y legible (modo denso + spriteK sin tocar).
- [ ] **Eliminar planta "huge"** (backend/datos · dueño: **OpenCode**)
  - Quitar `"huge"` de `PLANT_CONFIGS` en `backend/app/data_maps.py`.
  - Borrar `backend/app/data/maps/huge.json` y `backend/app/data/seeds/seed_huge.json` (y `backend/scripts/convert_huge.py`).
  - Ajustar `backend/tests/test_round10.py` (usa `SimulationEnvironment("huge")` en línea 37 → cambiar a `quito`/fixture) para que **pytest siga verde** (64/64).
  - Verificar que `/api/v1/plants` ya NO liste huge y que el default siga `quito`.

## 1) Mapa "realistic" (lo que viene)

- [ ] **Recibir la imagen del mapa dibujado a mano** (input del usuario)
  - Guardar la imagen de referencia en el repo (p. ej. `backend/app/data/maps/reference_realistic.png` o `reference/`) para trazabilidad.
- [ ] **Portar el dibujo → layout JSON `realistic.json`** (backend/datos · dueño: **OpenCode**)
  - Digitalizar sobre la imagen: canvas W/H, nodos semánticos, pasillos uni/bi, zonas con etiquetas, líneas (con `buffer_nodes`), cargadores, peatones, puntos buffer.
  - Reusar la mecánica de `convert_huge.py` como plantilla (aliases core `WH_MP_*`, `WH_PT_*`, `L*_OUT`, `E*_IN`; guarda de alcanzabilidad).
- [ ] **Registrar "realistic" en `PLANT_CONFIGS`** + `seed_realistic.json` (3-4 líneas SKU Nestlé, 4-6 AMRs con `home_zone` válido).
- [ ] **Validación backend**: boot 180+ ticks sin errores, `select_plant("realistic")`, snapshot, `pytest` suite completa verde.

## 2) Narrativa pitch: la ruta = LiDAR del AMR 🚚✨

> Concepto gancho del pitch: _"lo que ves trazado en el piso es el barrido LiDAR del AMR mapeando su entorno en tiempo real"_ → la ruta planificada se convierte en parte del storytelling de navegación autónoma.

- [ ] **Ruta como sweep LiDAR** (frontend · dueño: **Cursor**)
  - Renderizar el trazo de ruta planificado de cada AMR como un barrido tipo LiDAR (línea de escaneo con pulso/cono animado en la dirección de avance + rastro del path recorrido), con toggle **"Vista LiDAR"** en el mapa; leyenda/etiqueta para el jurado ("LiDAR · SLAM run").
  - Mantener legibles las 4 cosas del demo: mapa, AMRs, rutas, líneas.
- [ ] **AMRs del mismo color en Realistic** (frontend · dueño: **Cursor**)
  - En el mapa "realistic", todos los AMRs usan el **mismo color** (p. ej. rojo marca) → flota unificada (coherencia con branding y con la narrativa "una sola flota inteligente").
  - El color por AMR (actual `getAmrColor(i)`) se mantiene para quito/guayaquil si conviene; en realistic → color único.
- [ ] **Ajuste fino de animación**: sincronizar el sweep LiDAR con el LERP 60fps, sin romper estados/notices.

## 3) Cierre del demo (pitch 5 min)

- [ ] **Planta por defecto del arranque = "realistic"** (o la que el usuario elija) al levantar el stack Docker.
- [ ] **Mini-guion pitch 5 min cronometrado** (0:00–5:00 + 2 min Q&A): abrir con el problema Nestlé, demo en vivo de realistic (LiDAR + flota unificada), métricas ROI, cierre con sostenibilidad/escalabilidad. Preguntas difíciles y respuestas preparadas.
- [ ] **Smoke test final**: `docker compose up --build`, planta realistic, 1 min de sim sin errores, tsc EXIT 0.

---

**Checklist rápida de estado**

- [ ] Branding rojo/blanco
- [ ] Huge eliminado
- [ ] Imagen realistic recibida
- [ ] realistic.json portado + registrado + seed
- [ ] Ruta = LiDAR implementado
- [ ] AMRs mismo color en realistic
- [ ] Default+pitch listo
