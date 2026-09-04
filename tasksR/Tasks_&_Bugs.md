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
- [ ] **Corregir realistic.json por feedback del usuario (4-sep)** — ✅ HECHO (commit `5112bde`): OUT movido al apartado medio (nodo OUT 530,200 → X_M02; zona "OUT (medio)" x480,y100 100×280); paredes negras respetadas (quitadas X_R15→X_M06 y WH_PT_1→X_M06 que cruzaban muros; WH_PT_1 reconectado vía sur X_M08); arista fantasma 815→WHT1 eliminada. Grafo 75 nodos conexo, pytest 72/72, en vivo OK.
- [x] **Flujo de negocio del paquete: MP→Línea→Paletizado→Out→fin** — ✅ HECHO (commit `2290d01`, por Deep): EXPEDITION aditivo, línea acumula 20 s → PICKUP_PT (Línea→WH_PT), Paletizado→OUT con fin de recorrido. pytest 76/76; en vivo 7 SUPPLY + 6 PICKUP + 6 EXPEDITION a OUT.
- [x] **Default + pitch** — hecho (4-sep).
  - Default planta = `realistic` al arranque del stack (commit `cabeaa0`): `sim_env` arranca con `DEFAULT_PLANT_ID="realistic"` (75 nodos); frontend `DEFAULT_PLANT_ID="realistic"` + fallback offline "Planta Realistic"; fallback local Web solo para Quito. pytest 76/76 (api_integration/smoke fijan quito explícito), tsc EXIT 0, /health reporta `plant:"realistic"`.
  - Mini-guion pitch 5 min + Q&A preparado: `tasksR/pitch_5min.md`. Narrativa: flota AMRs unificada color Nestlé → barrido LiDAR = percepción real → flujo paquete MP→Línea→Paletizado→OUT.
  - Smoke test final ✅: rebuild api+web, 60 s de sim realistic (+296 ticks) sin errores en logs, web HTTP 200, misiones vivas 11 SUPPLY + 9 PICKUP_PT + 6 EXPEDITION + 1 RELOCATION.
- [x] **Feedback layout ronda 2 + muros visibles** — ✅ HECHO (commit `b5b377b`, 4-sep).
  - Topología según usuario: `X_T11 ↔ OUT` (se quita `OUT→X_M02` — "el nodo T11 va a OUT, no M02"); `WH_MP_5` conectado **solo a X_R25** (se quita X_R22) y nodo movido a (860,300); `WH_PT_3` movido a zona M05 (nodo 400,300) con arista `WH_PT_3↔X_M05` (se quita X_R18).
  - **BUG "los muros no existen aun"** → resuelto: nueva capa `walls` en realistic.json (W1 este del patio OUT x596 y70 w8 h320; W2 oeste x440 y70 w8 h230) + tipos `LayoutWall` y render sólido oscuro en PlantMap (entre zonas y aristas). Verificado: ninguna pared cruza una arista existente (crossings=0).
  - test_round13#test_04 actualizado (vecino de OUT ahora X_T11). Validado: pytest 76/76, tsc EXIT 0, grafo 75 nodos conexo, livedemo 45 s sin errores (7 SUPPLY + 5 PICKUP_PT + 2 EXPEDITION + 1 RELOCATION).
  - ⚠️ Nota: los muros colocados son consistentes con la topología; si la posición exacta difiere de la foto anotada del usuario, ajustar W1/W2 o añadir más en realistic.json.
- [x] **Feedback layout ronda 2.1 — nodos B10/B20 + muros FÍSICOS + borde externo** — ✅ HECHO (commit `c20a8af`, 4-sep).
  - Nodos nuevos de almacén **B10(760,470) ↔ X_T16** y **B20(800,470) ↔ X_T17** (docks, como indicó el usuario).
  - **W1 movido** a (609,57,8,364) ajustando el recorrido; queda W2 (440,70,8,230).
  - **Paredes externas (borde del perímetro)**: W_TOP (0,0,1000,8), W_BOTTOM (0,592,1000,8), W_LEFT (0,0,8,600), W_RIGHT (992,0,8,600).
  - **BUG "los humanos atraviesan los muros"** → resuelto de raíz: `build_plant_graph` en `data_maps.py` filtra toda arista que cruce un rect de `layout.walls` (intersección segmento↔rect, pad 0.5, incluye endpoint-inside). Ni AMRs (A* por aristas) ni peatones pueden atravesar una pared. Solo plantas con `walls`; quito/guayaquil intactos.
  - Layout final: **77 nodos / 92 aristas / 6 muros**. Test guard `test_walls.py` (ninguna pared cruza arista; conteo dinámico). **pytest 79/79**, tsc EXIT 0, ciclo misiones vivo. Si el usuario reenvía el layout original, afinar el perímetro del borde.
