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

- [ ] **Flujo de negocio del paquete MP→Línea→Paletizado→Out** (backend · dueño: **Antigravity**)
  - Req usuario 4-sep: "los paquetes del momento en que entra materia prima a la linea de produccion, sale a paletizaje en 20segundos para este MVP, de Paletizaje a Out y de Out termina el recorrido". Estado actual: la sim solo genera SUPPLY_REQUEST (MP→línea); "Out" es solo zona visual sin nodo. En curso (despachada 4-sep).
- [ ] **Planta por defecto del arranque = "realistic"** (o la que el usuario elija) al levantar el stack Docker.
- [ ] **Mini-guion pitch 5 min cronometrado** (0:00–5:00 + 2 min Q&A): abrir con el problema Nestlé, demo en vivo de realistic (LiDAR + flota unificada), métricas ROI, cierre con sostenibilidad/escalabilidad. Preguntas difíciles y respuestas preparadas.
- [ ] **Smoke test final**: `docker compose up --build`, planta realistic, 1 min de sim sin errores, tsc EXIT 0.

---

**Checklist rápida de estado**

- [x] Branding rojo/blanco (109f819)
- [x] Huge eliminado (109f819)
- [x] Imagen realistic recibida (4-sep)
- [x] realistic.json portado + registrado + seed (30fdd60)
- [x] Ruta = LiDAR implementado (46a605a)
- [x] AMRs mismo color en realistic (46a605a)
- [ ] Flujo de negocio del paquete MP→Línea→Paletizado→Out (Antigravity, en curso)
- [ ] Default+pitch listo
