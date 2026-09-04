# Tasks & Bugs — Estado real (actualizado 4-sep)

> Este fichero refleja el estado ACTUAL del trabajo. Lo que ya está resuelto figura como ✅.
> El checklist vivo por-ítem está en `tasksR/plan_realistic.md`.

## Bugs

- [x] **Bug: AMR esperando forever en nodos** (v1) — resuelto (commit `ef62b19`, día previo). Timeouts de congelamiento, `_estado_desde`, bypass peatón estacionario. Suite 68/68.
- [x] **Bug: AMR idle en nodo operativo bloquea forever** (v2, "nodo 7") — resuelto (commit `de63d7e`, 4-sep). Relocación de IDLE desde nodos operativos + desalojo proactivo (RELOCATION p4). Suite 72/72. Livedemo Quito sin deadlock.

## Ronda "realistic"

- [x] **Branding rojo/blanco** (frontend) — hecho (commit `109f819`).
- [x] **Huge eliminado** (backend/datos) — hecho (commit `109f819`).
- [x] **Imagen realistic recibida** — recibida 4-sep, copiada a `backend/app/data/maps/reference/` (2 jpgs).
- [x] **realistic.json portado + registrado + seed** — hecho (commit `30fdd60`, 4-sep). 74 nodos/90 aristas/4 zonas/3 peatones, 5 AMRs; pytest 72/72; validado en vivo.
- [x] **Ruta = LiDAR implementado** — hecho (commit `46a605a`, 4-sep). Sweep LiDAR (rastro glow + cono/spotlight + pulso por simTime) con toggle 📡 en ControlPanel; default ON en realistic.
- [x] **AMRs mismo color en realistic** — hecho (commit `46a605a`, 4-sep). Flota roja `#E4032E` unificada; aros de estado semánticos intactos; paleta por índice se mantiene en quito/guayaquil.
- [ ] **Flujo de negocio del paquete: MP→Línea→Paletizado→Out→fin** (nuevo req usuario 4-sep) — "los paquetes del momento en que entra materia prima a la linea de produccion, sale a paletizaje en 20segundos para este MVP, de Paletizaje a Out y de Out termina el recorrido". ⏸️ BLOQUEADO: el usuario marcó que el OUT está mal ubicado y hay que corregir el layout primero (abajo). EN CURSO la corrección, luego se reanuda.
- [ ] **Corregir realistic.json por feedback del usuario (4-sep)**: foto anotada `image-5` en `backend/app/data/maps/reference/realistic_feedback_out_paredes.png`. (1) OUT → apartado medio (marca morada); (2) paredes negras no atravesables (quitar/bloquear aristas que las crucen); (3) arista fantasma "815→WHT1" (WH_PT_1) no existe → quitarla. EN CURSO (OpenCode).
- [ ] **Default + pitch** — pendiente.
