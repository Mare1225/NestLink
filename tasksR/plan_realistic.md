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
- [ ] **Portar el dibujo → layout JSON `realistic.json`** (backend/datos · dueño: **OpenCode**)
  - Digitalizar sobre la imagen (`realistic_grafo_nodos.jpg`): canvas W/H, nodos semánticos, pasillos uni/bi, zonas con etiquetas, líneas (con `buffer_nodes`), cargadores, puntos buffer.
  - ⚠️ **Requisito del usuario (peatones):** el GRAFO DIBUJADO EN ROJO define por dónde camina un humano de forma ALEATORIA (peatón recorriendo nodos del grafo rojo). Además, ENTRE MATERIA PRIMA y PALETIZAJE también caminan humanos → definir rutas de peatones que crucen ese pasillo (zona entre almacén MP y paletizado/empacadoras). Incluir en realistic.json y/o seed la definición de peatones/rutas para que la simulación los modele como en las otras plantas.
  - Reusar la mecánica de `convert_huge.py` como plantilla (aliases core `WH_MP_*`, `WH_PT_*`, `L*_OUT`, `E*_IN`; guarda de alcanzabilidad).
- [ ] **Registrar "realistic" en `PLANT_CONFIGS`** + `seed_realistic.json` (3-4 líneas SKU Nestlé, 4-6 AMRs con `home_zone` válido — NO operativo, ver fix de waiting v2).
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

- [x] Branding rojo/blanco
- [x] Huge eliminado
- [x] Imagen realistic recibida
- [ ] realistic.json portado + registrado + seed
- [ ] Ruta = LiDAR implementado
- [ ] AMRs mismo color en realistic
- [ ] Default+pitch listo
