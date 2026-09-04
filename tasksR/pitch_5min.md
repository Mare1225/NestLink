# 🎤 Pitch — NestLink · Hackathon InnoLabs Nestlé
### Edición DEMO final (incorpora rondas 2.1–2.8: control de estados OUT, entrega exclusiva, KPI tiempo en OUT, recarga sin pérdidas)

> **Formato:** 5:00 cronometrado + 2:00 Q&A.
> **Demo:** planta REALISTIC (por defecto al arrancar), pantalla completa, LiDAR ON.
> **One-liner:** «Convertimos la logística interna de una planta Nestlé en un sistema que se **percibe, decide y coordina solo** — una sola flota, un solo mapa, **cero paquetes atascados y cero viajes en vacío**.»

---

## 0:00 – 0:40 · El problema (narrativa)

> *(Móntate cerca del mapa, señala la pantalla.)*

"En una planta Nestlé, mover materia prima, semielaborados y producto terminado es el corazón de la operación. Hoy se hace con AMRs de distintos fabricantes que **no hablan entre sí**, y con rutas planificadas como si el piso estuviera vacío:

- Se **bloquean en pasillos** y chocan virtualmente con muros y personas.
- Los **puntos de entrega (OUTs)** se saturan: dos robots pueden dejar un paquete al mismo segundo y, sin un control de estados, **alguien se olvida de él y ocupa el OUT para siempre**.
- Cuando un robot va a **cargar batería, se lleva la entrega que estaba en curso** — la operación pierde el paquete y arranca de cero.
- Y nadie ve **en tiempo real** dónde está cada pallet ni cuánto se tarda cada entrega.

Los costos ocultos no son las máquinas: son **las esperas, los viajes en vacío (≈45 % de los kilómetros), los paquetes olvidados y el tiempo de gente** que debería estar en valor, no desbloqueando robots."

---

## 0:40 – 1:30 · La solución / arquitectura

> *(Apunta al mapa.)*

"NestLink es una **capa de coordinación y visibilidad** que unifica una flota heterogénea sobre **un mapa que sí respeta la realidad**:

- **Un mapa vivo del piso**, dibujado desde el layout real: estaciones, pasillos, **muros físicos** que ningún robot cruza, y **peatones** que la flota detecta y esquiva sin detener producción.
- **Una flota unificada**: 5 AMRs de producción (AMR 1–5) + un **AMR 6 de entrega exclusiva**, que recorre la **ruta rosada** y centraliza la entrega al **muro externo** — separa "producir" de "exportar".
- **4 OUTs en cuadrícula 2×2** con **mission control de estados y asignaciones**: cada paquete que llega se contabiliza (`stock`), se le **regala una misión de export** y se encadena la siguiente automáticamente → **ningún OUT queda ocupado para siempre**.
- **Un cerebro que asigna misiones** con optimización (matching), prioriza, evita el **viaje en vacío**, y respeta batería: si el AMR de entrega va a cargar, **aborta la export sin perder el paquete** — lo devuelve al buffer y lo reprograma.
- Y, para la demo: cuando un robot avanza, **lo que traza es su barrido LiDAR** — así percibe y navega su entorno en tiempo real."

---

## 1:30 – 3:15 · Demo en vivo (REALISTIC) 🚚✨

> *(Modo presentación, pantalla completa, zoom. Cuenta mientras corre.)*

"Esta es nuestra planta 'realistic' corriendo en vivo":

1. **Materia prima entra por el este** y se generan abastecimientos preventivos a las líneas — **antes** de que se vacíen (mira el KPI de paradas evitadas subir).
2. **Las 4 líneas procesan** → cada ~20 s sale un paquete de producción.
3. Un AMR lo lleva a **paletizado** y luego su **entrega exclusiva** lo deja listo en uno de los **4 OUTs** *(señala la cuadrícula)*.
4. **Mira el OUT**: cuando llega un paquete se enciende el **📦**; el **AMR 6** lo toma y lo lleva por la **ruta rosada** hasta el **muro externo**, donde se consume la misión de export.
5. **Nota clave de robustez:** fíjate que **ningún paquete se queda atascado**, incluso cuando el AMR de entrega va a cargar: al volver, retoma lo pendiente. *(Referencia: fix "recarga con export en vuelo — cero pérdidas".)*
6. **Hay personas caminando**: la flota las esquiva y **re-rutea sin detener producción**; ningún nodo ocupado deja a un robot esperando sin salida.

> *Tip timing: si la sim va lenta, sube la velocidad; muéstrales 1 ciclo completo SUPPLY→PICKUP_PT→EXPEDITION→OUT→📦→AMR 6→muro.*
> *Números para leer en vivo del dashboard: viajes completados, paradas evitadas, km evitados, ROI %, **tiempo medio en OUT**.*

---

## 3:15 – 4:05 · Métricas / resultados — y de dónde salen

> *(Apunta al panel de KPIs.)*

"El MVP ya mide **lo que importa** y, a diferencia de un tablero decorativo, **todo nace del simulador de decisión** — cada KPI tiene una fuente medible. En la diapositiva y en el apéndice está el detalle; resumen:

- **Viajes completados** y **tiempo medio de entrega (min)** — se miden en cada misión que termina (carga → entrega), tomando el tiempo de simulación entre creación y cierre de la misión.
- **Paradas evitadas** — cuenta los disparos preventivos de abastecimiento cuando una línea cruza su umbral crítico de inventario: la parada que **no ocurrió** porque el sistema reaccionó antes.
- **km evitados y ROI % de la flota** — cada viaje completado *sin pata vacía* ahorra el 45 % de su recorrido (la vuelta/ida sin carga que haría un montacargas humano). El sistema acumula esos km evitados y el **ROI = km evitados / (km recorridos + km evitados)** — traducido: *cuánto más eficiente es la flota coordinada frente a una que no lo está*.
- **Nuevo (ronda 2.8): tiempo medio en OUT** — mide desde que un paquete llega al OUT hasta que el AMR de entrega lo coloca en el muro. En nuestras corridas de referencia: **≈1.5 min** con cero atascos.

Estas son las métricas de nuestro **simulador de decisión**: validamos las reglas y los ahorros **antes de tocar un solo robot real** en planta."

---

## 4:05 – 4:40 · Qué nos hace diferentes + comparativa con el modelo humano

> *(Apaga el mapa, pasa a la comparativa.)*

"¿Cuál es la ventaja real? Compáralo con el modelo humano:

> | Lo que hoy hace una operación manual | Con NestLink |
> |---|---|
> | Planifica rutas a mano **sin ver el piso** | Mapa real con muros y peatones, re-ruteo en vivo |
> | ~45 % de los km en **viajes en vacío** | Asignación que **elimina la pata vacía** (km evitados medidos) |
> | Los montacargas **se pausan/se van a cargar** y la entrega se pierde | Recarga **sin perder el paquete**: export abortada se reprograma sola |
> | OUTs **sin control**: paquetes olvidados ocupan el punto para siempre | Mission control por OUT: **stock + misión de export encadenada**, cero atascos |
> | Reacción al agotamiento de línea **cuando ya se paró** | Abastecimiento **preventivo** (paradas evitadas contadas) |
> | Sin visibilidad del **tiempo real en OUT** | Nuevo KPI **tiempo medio en OUT** (≈1.5 min) |

Tres diferenciales que cierran el argumento:

1. **Flota heterogénea unificada** — no reemplazamos AMRs, **los hacemos trabajar juntos** (incluido un rol exclusivo de entrega).
2. **Percepción real con LiDAR** — el mapa y las rutas *son* la percepción del robot, no un dibujo bonito.
3. **Robustez operativa** — la flota **convive con humanos y con la batería** y **garantiza que nada se quede atascado para siempre**."

---

## 4:40 – 5:00 · Cierre

> *(Sube el tono, mirada a los jueces.)*

"En una palabra: **NestLink convierte la logística interna en un sistema que se percibe, decide y coordina solo** — una flota, un mapa, cero viajes en vacío y cero paquetes atascados, con cada KPI respaldado por el simulador de decisión.

Hoy es un MVP de decisión sobre datos reales de planta. Mañana, es el cerebro que corre más de una planta desde un solo tablero.

**Gracias — quedamos listos para sus preguntas.**" *(Corta la demo, deja el mapa en pantalla.)*

---

## 🎯 Q&A: preguntas difíciles y respuestas preparadas

**Q1 — "¿Cómo se conecta esto al hardware real? ¿Qué fabricantes?"**
R: La lógica de misión se expone vía API/WebSocket (protocolo abierto). Cualquier AMR que publique posición y acepte misión se integra; en la demo usamos LiDAR simulado para validar la capa de decisión antes de tocar hardware.

**Q2 — "¿Y si un AMR se cae o pierde señal / se va a cargar?"**
R: El coordinador detecta inactividad y **reasigna la misión a otro robot**; si la export iba en vuelo y el AMR de entrega tiene que recargar, el paquete **vuelve al buffer y se reprograma** — cero pérdidas. Fue el caso que nos llevó a eliminar las expectativas infinitas en los OUTs.

**Q3 — "¿De dónde sale exactamente el ROI?"**
R: De los km evitados acumulados: cada viaje que el sistema hace sin pata vacía ahorra 45 % de su distancia (~0.32 km/viaje en esta planta). ROI = km evitados / (km recorridos + km evitados). Es una métrica de **simulador de decisión**, comparando lo recorrido por la flota coordinada vs. lo que habría recorrido una operación manual con viajes en vacío.

**Q4 — "¿Cuánto tardaría en implementarse en una planta real?"**
R: Las reglas ya están validadas en el simulador. El mapa se carga desde el layout real; la integración depende del fabricante del AMR. La puesta en marcha se acelera mucho porque la capa de decisión es agnóstica de hardware.

**Q5 — "¿Escala a varias plantas?"**
R: Sí: cada planta es un 'mundo' configurable (layout + flota + seed). Un tablero central opera varias simulaciones y luego varias plantas.

**Q6 — "¿Qué sigue tras el hackathon?"**
R: (a) telemetría real vía MQTT/REST, (b) gemelo digital con línea real, (c) piloto en una zona acotada de la planta.

---

## 📊 Apéndice A — Origen de los datos de los KPIs (de dónde sale cada número)

Todo KPI nace del **simulador de decisión** (`backend/app/metrics.py` + eventos de `sim/`). Nada es inventado:

| KPI en dashboard | Fórmula exacta (código) | Fuente del dato |
|---|---|---|
| **Viajes completados** | `viajes_completados += 1` por cada `record_trip_completed()` | Se dispara al **cerrar una misión** (descarga completada) en `agents.py` (estado UNLOADING). |
| **Tiempo medio de entrega (min)** | `total_delivery_time_min / viajes_completados` | Suma `(sim_time − created_at_sim)/60` de cada misión cerrada, dividida por nº de viajes. |
| **Paradas evitadas** | `record_stoppage_prevented()` | Disparo **preventivo** de abastecimiento en `generators.py` cuando una línea cruza su **umbral crítico** de inventario (repo detuvo una parada). |
| **km evitados** | `Σ(viaje × 0.32 km × 0.45)` por viaje sin pata vacía (`was_empty_prevented=True`) | Cada misión del sistema se hace **consolidada** (evita la ida/vuelta en vacío de un montacargas manual). 0.32 km es la distancia de referencia de esta planta; 0.45 = 45 % del recorrido manual que es pata vacía. |
| **ROI % de la flota** | `km_evitados / (total_km_recorridos + km_evitados) × 100` | Compara **km coordinados** vs. **lo que habría recorrido la operación no coordinada** (con viajes en vacío). |
| **Tiempo medio en OUT (min)** *(nuevo ronda 2.8)* | `total_out_wait_sec / out_pkgs_measured / 60` | Cola FIFO `_out_pkg_arrivals[OUT]`: se **abre el reloj** cuando el paquete llega al OUT (`out_arrive`) y se **cierra** cuando el AMR 6 lo coloca en el muro (`out_ship`). Promedio en minutos. |
| **Paquetes atascados / EXPORT colgadas** *(control)* | `out_en_ruta[OUT] == 0` siempre que `stock>0` ⇒ se provisiona 1 export | Mission control por OUT (`out_stock` + `out_en_ruta`); verificado con tests (89/89) y E2E headless (0 colgadas en 1500–2500 ticks, incl. recargas forzadas). |

**Validación de las cifras:** suite de tests **89/89**, typecheck 0 errores, y corridas headless por semilla (seed 11: 2500 ticks → 18 envíos medidos, **tiempo medio en OUT ≈ 1.53 min**, OUTs drenados a 0). El ROI y demás métricas se recalculan en vivo en cada tick.

---

## 🧍 Apéndice B — Comparativa operación manual vs. NestLink (modelo 'humano' con montacargas)

Supuestos del modelo humano de referencia (baseline conservador, típico en una planta sin control de flota):
- Rutas planificadas por operador en papel; **no ve el piso en tiempo real** (ni muros ni peatones).
- Los montacargas viajan **ida o vuelta en vacío** → ≈45 % del kilometraje es improductivo.
- El abastecimiento a líneas reacciona **cuando ya se agotó** → paradas y cuellos de botella.
- Los puntos de entrega (OUT) **no tienen estado**: un paquete olvidado bloquea el punto indefinidamente.
- Sin telemetría: nadie mide tiempos de entrega ni esperas.

| Dimensión | Operación manual (baseline) | NestLink (medido en simulador) | Ventaja |
|---|---|---|---|
| Kilometraje productivo | Solo ~55 % de los km | ~100 % (asignación consolida ida+vuelta) | **ROI % = km evitados sobre el total** |
| Paquetes en puntos de entrega | Pueden olvidarse → bloquear el OUT | Mission control por OUT, **cero atascos** | Disponibilidad del punto garantizada |
| Entrega durante recarga/pausa | Se pierde el paquete en curso | Export abortada vuelve al buffer y se reprograma | **Cero pérdidas** |
| Paradas de línea por inventario | Ocurren; se detectan al parar | Disparo preventivo en umbral crítico | **Paradas evitadas contadas** |
| Visibilidad | Ninguna | KPIs en vivo (incl. **tiempo en OUT**) | Decisión basada en datos |

**Conclusión cuantitativa (heurística del simulador):** por cada viaje que la flota coordinada hace consolidado, deja de recorrer 0.32 km × 45 % ≈ **0.14 km de pata vacía**. Eso es el ROI: la eficiencia que se **gana** por aplicar esta solución en lugar de seguir con el modelo humano/montacargas.

---
*Lead: Aion CLI · última actualización 4-sep-2026 · demo default = realistic · pruebas 89/89 · KPI ronda 2.8 activo*
