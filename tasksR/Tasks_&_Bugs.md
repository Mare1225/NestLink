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
- [ ] **Ruta = LiDAR implementado** — EN CURSO (Cursor, task despachada 4-sep).
- [ ] **AMRs mismo color en realistic** — EN CURSO (Cursor).
- [ ] **Default + pitch** — pendiente.
