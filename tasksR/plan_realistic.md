# 📋 Plan: mapa "realistic" (dibujado a mano) + nueva ronda de cambios

> Estado: **IMAGEN RECIBIDA (4-sep)** — port de realistic en curso.
> Se marca ✅ cada ítem al completarse. Este archivo es el coordinador de la ronda (lead: Aion CLI).

## 0) Cambios de fondo (ya autorizados, pueden arrancar ya)

- [x] **Branding Nestlé — Rojo + Blanco** (frontend · dueño: **Cursor**)
  - ✅ Hecho (commit 109f819): tema claro marca, rojo `#E4032E`, superficies blancas; PlantMap intacto, tsc EXIT 0.
- [x] **Eliminar planta "huge"** (backend/datos · dueño: **OpenCode**)
  - ✅ Hecho (commit 109f819): fuera de PLANT_CONFIGS, borrados huge.json/seed_huge/convert_huge, test_round10 ajustado, /plants sin huge, default quito, pytest 64/64.

## 1) Mapa "realistic" (lo que viene)

- [x] **Recibir la imagen del mapa dibujado a mano** (input del usuario)
  - ✅ Recibido 4-sep (2 archivos). Copiados al repo para trazabilidad en `backend/app/data/maps/reference/`:
    - `realistic_grafo_nodos.jpg` (1539×1150) — el mapa con el GRAFO dibujado en ROJO.
    - `realistic_presentacion.jpg` (1518×1149) — el mapa para la presentación.
- [x] **Portar el dibujo → layout JSON `realistic.json`** (backend/datos · dueño: **OpenCode**)
  - ✅ Hecho (commit 30fdd60, 4-sep): canvas 1000×600, 74 nodos, 90 aristas bi (180 dirigidas), 4 zonas etiquetadas, 1 línea (L1..L2, E1..E2) con buffer_nodes + zonas MP/Out, 3 peatones, registrado en PLANT_CONFIGS.
  - ⚠️ **Requisito de peatones del usuario cumplido:** PED_01 recorre el GRAFO ROJO de forma ALEATORIA (X_T02→X_T08→X_M04→X_R11→X_R15→X_T12); PED_02 camina ENTRE MATERIA PRIMA y PALETIZADO (WH_MP_2→X_R23→X_M06→WH_PT_1); PED_03 pasillo. Validado en vivo: 3 OPERATOR en snapshot, todos en movimiento.
- [x] **Registrar "realistic" en `PLANT_CONFIGS`** + `seed_realistic.json` (4 líneas SKU Nestlé, 5 AMRs con `home_zone` en cruces X_* — NO operativo, ver fix de waiting v2).
- [x] **Validación backend**: boot 180+ ticks sin errores, `select_plant("realistic")`, snapshot (5 AMRs + 3 peatones + 4 líneas), integridad de grafo (conectado, sin huérfanos), `pytest` suite completa **72/72 verde**.

## 2) Narrativa pitch: la ruta = LiDAR del AMR 🚚✨

> Concepto gancho del pitch: _"lo que ves trazado en el piso es el barrido LiDAR del AMR mapeando su entorno en tiempo real"_ → la ruta planificada se convierte en parte del storytelling de navegación autónoma.

- [x] **Ruta como sweep LiDAR** (frontend · dueño: **Cursor**)
  - ✅ Hecho (commit 46a605a, 4-sep): PlantMap sweep LiDAR (rastro glow cian + cono/spotlight en dirección de avance + rayo + dash animado por simTime determinista) + toggle 📡 "LiDAR" en ControlPanel (estilo marca, default ON al seleccionar realistic) + leyenda "LiDAR · SLAM run". tsc EXIT 0.
- [x] **AMRs del mismo color en Realistic** (frontend · dueño: **Cursor**)
  - ✅ Hecho (commit 46a605a, 4-sep): `getAmrColor(i, plantId)` → NESTLE_FLEET_RED #E4032E unificado si plantId==="realistic"; paleta por índice intacta en quito/guayaquil; aros de estado semánticos sin cambio.
- [ ] **Ajuste fino de animación**: sincronizar el sweep LiDAR con el LERP 60fps, sin romper estados/notices (verificación visual pendiente tras smoke test).

## 3) Cierre del demo (pitch 5 min)

- [x] **Flujo de negocio del paquete MP→Línea→Paletizado→Out** (backend · dueño: **Antigravity**)
  - Req usuario 4-sep: "los paquetes del momento en que entra materia prima a la linea de produccion, sale a paletizaje en 20segundos para este MVP, de Paletizaje a Out y de Out termina el recorrido". Estado: ✅ resuelto por Deep (2290d01) — ver abajo.
- [x] **Planta por defecto del arranque = "realistic"** (o la que el usuario elija) al levantar el stack Docker.
  - ✅ Hecho (commit cabeaa0, 4-sep): `sim_env` arranca en `DEFAULT_PLANT_ID="realistic"` (75 nodos); frontend `DEFAULT_PLANT_ID="realistic"` + fallback offline "Planta Realistic"; fallback local queda solo para Quito; tests api_integration/smoke fijan quito explícito. pytest 76/76, tsc EXIT 0, /health reporta plant=realistic.
- [x] **Mini-guion pitch 5 min cronometrado** (0:00–5:00 + 2 min Q&A): abrir con el problema Nestlé, demo en vivo de realistic (LiDAR + flota unificada), métricas ROI, cierre con sostenibilidad/escalabilidad. Preguntas difíciles y respuestas preparadas.
  - ✅ Hecho: `tasksR/pitch_5min.md` (guion 0:00–5:00 + 5 preguntas Q&A con respuestas).
- [x] **Smoke test final**: `docker compose up --build`, planta realistic, 1 min de sim sin errores, tsc EXIT 0.

---

- [x] **Flujo de negocio del paquete MP→Línea→Paletizado→Out** (backend · dueño: **Deep**)
  - ✅ Hecho (commit 2290d01, 4-sep): EXPEDITION (tipo aditivo), línea con acumulador 20 s genera PICKUP_PT Línea→WH_PT cada ~20 s con insumo; al entregar en Paletizado se encadena EXPEDITION WH_PT→OUT (fin del recorrido, sin misión posterior). pytest 76/76; en vivo realistics mostró 7 SUPPLY + 6 PICKUP_PT + 6 EXPEDITION a OUT.

**Checklist rápida de estado**

- [x] Branding rojo/blanco (109f819)
- [x] Huge eliminado (109f819)
- [x] Imagen realistic recibida (4-sep)
- [x] realistic.json portado + registrado + seed (30fdd60)
- [x] Ruta = LiDAR implementado (46a605a)
- [x] AMRs mismo color en realistic (46a605a)
- [x] Corrección layout realistic OUT/paredes/arista (5112bde)
- [x] Flujo de negocio del paquete MP→Línea→Paletizado→Out→fin (2290d01)
- [x] Default+pitch listo (default=cabeaa0 · pitch=pitch_5min.md)
- [x] Feedback ronda 2 (b5b377b): X_T11↔OUT (no X_M02), WH_MP_5→X_R25 solo, WH_PT_3→X_M05, y **muros VISIBLES** (bug "los muros no existen aun") — capa `walls` en realistic.json + render negro en PlantMap, sin cruzar aristas. pytest 76/76, tsc EXIT 0.

## Check-puntos pendientes / posibles ajustes (demo day)
- [ ] Si el usuario ajusta la posición de los muros según su foto anotada → mover W1/W2 (o añadir más) en `realistic.json`. Por ahora 2 muros consistentes con la topología (W1 este del patio OUT x596 y70 h320; W2 oeste x440 y70 h230).
