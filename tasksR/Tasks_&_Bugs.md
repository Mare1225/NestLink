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
- [x] **Feedback layout ronda 2.2 — quitar B10/B20, docks = X_R10/X_R20 + W1 al oeste** — ✅ HECHO (commits `99e6be8`+`b99d92e`, 4-sep).
  - **B10/B20 eliminados** (error del usuario: "me equivoque queria decir los nodos x_r10 y x_r20"). Ahora **X_T16 → X_R10** y **X_T17 → X_R20** (aristas bi length 12). Nodos almacén ya no existen como tales.
  - **W1 CORREGIDO al OESTE de OUT** → (472,64,8,240), cara oeste de OUT (entre W2@440 y borde oeste de OUT@480). La colocación previa al este (x609, commit c20a8af) **era errónea**: venía de leer el archivo equivocado cuando la visión falló. La lectura calibrada de Cursor sobre la imagen que el usuario anotó (`image-1(2).png`) + raster póster (`realistic_presentacion.jpg`) confirman que **no hay pared al este** — solo 2 muros oeste (W1/W2) + perímetro.
  - Layout final: **75 nodos / 92 aristas / 6 muros** (W1, W2, W_TOP, W_BOTTOM, W_LEFT, W_RIGHT). Grafo conexo 75/75, **pytest 79/79**, tsc EXIT 0, en vivo OK (`/api/v1/layout?plant=realistic` = 75/92/6).
- [x] **Feedback ronda 2.3 — alargar muros centrales al sur + BUG peatones atraviesan muros** — ✅ HECHO (commit `9be1838`, 4-sep).
  - **W1 (472,64,8,528)** y **W2 (440,70,8,522)** alargados hasta la **pared externa sur (y=592)**, como pidió el usuario.
  - **BUG (todavía reproducible): los peatones PODÍAN atravesar las paredes.** Causa: `PedestrianAgent.step` se movía en línea recta entre waypoints sin comprobar muros (los AMR usaban el grafo filtrado G, los peatones no).
  - **Fix de raíz:** `ObstacleManager` construye el grafo filtrado G y para cada peatón calcula **ruta segura** = secuencia de nodos conectada por `nx.shortest_path` sobre G (aristas que no cruzan muros). `PedestrianAgent` camina sobre esa ruta cíclica + **clamp defensivo** en `step` (`_edge_crosses_walls`) como red de seguridad.
  - Test nuevo `tests/test_pedestrians_walls.py` (3 casos): rutas sin cruce, 300 steps sin peatón dentro de un muro, W1/W2 alcanzan y=592. **pytest 82/82**, grafo conexo 75/75 (0 aristas perdidas), stack rebuilt healthy.
- [x] **Feedback ronda 2.4 — nombres de AMRs → "AMR#"** — ✅ HECHO (commit `c5ad281`, 4-sep).
  - `seed_realistic.json`: solo `nombre` de AMR_01..AMR_05 → **"AMR 1".."AMR 5"** (ids AMR_01..AMR_05 intactos, no rompe env.py ni tests).
  - **PlantMap.tsx**: el label truncaba a la primera palabra (`split(" ")[0]`) → habría mostrado "AMR" para los 5; ahora si `nombre` empieza con "AMR " muestra el nombre completo. FleetDetailView/FleetBatteryPanel ya mostraban `nombre` completo.
  - Validado: pytest 82/82, tsc 0 errores, `/api/v1/fleet` → "AMR 1"…, layout en vivo 75/92/6.
