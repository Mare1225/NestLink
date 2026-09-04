# 🎙️ Guion Oral — NestLink · Pitch InnoLabs Nestlé
### Oral pitch slide a slide (lo que se dice en cada diapositiva del deck `tasksR/pitch_deck/index.html`)

> **Cómo usar esto:** habla natural, mira a la audiencia, no leas. La slide está en pantalla de soporte; tú cuentas la historia. Cada bloque corresponde a UNA slide del deck y se separa con `---`. Tiempo total aproximado: 5:00 (distingue entre 5 min cronometrados y Q&A posterior en la última block).

---

## Slide 1 · Portada

«Buenas tardes. Somos NestLink y convertimos la logística interna de una planta Nestlé en un sistema que **se percibe, decide y coordina solo**: una sola flota, un solo mapa, **cero paquetes atascados, cero viajes en vacío y menos energía por pallet movido**. En los próximos minutos les mostramos el problema, cómo lo resolvemos, por qué es viable y qué gana Nestlé con esto.»

---

## Slide 2 · Eje 1 · Problemática

«El reto que nos plantea Nestlé es muy claro: **¿cómo automatizar y optimizar el flujo de materiales y productos entre producción y almacenamiento**, usando tecnologías autónomas que mejoren productividad, eficiencia y seguridad?

Ese flujo va en **dos sentidos**. Primero, el **producto terminado**: sale de líneas de producción semiautomáticas y debe llegar de forma automática al almacenamiento. En el otro sentido, los **materiales**: deben abastecerse de manera **oportuna desde el almacén** hacia las máquinas empaquetadoras. Fíjense que es un vaivén constante, y cualquier fricción en uno de los dos sentidos frena todo el sistema.

Hoy, en el movimiento interno de materiales, encontramos costos que se esconden: **intervenciones manuales y tiempos improductivos**; **riesgos operativos** por el movimiento interno — choques, cuellos de botella, errores; y **recorridos, recursos y tiempos de abastecimiento que no están optimizados** — las empaquetadoras esperan insumos y el producto terminado no sale a tiempo.

Y el reto nos exige una respuesta con **costo-beneficio convincente**, que sea **viable en un entorno industrial real** y con **potencial de escalabilidad**. Los costos ocultos no son las máquinas: son los **viajes en vacío — cerca del 45 por ciento de los kilómetros —**, los **paquetes que se quedan atascados** y el **tiempo de gente** que debería estar creando valor, no desbloqueando robots.»

---

## Slide 3 · Eje 2 · Solución y Viabilidad

«Nuestra respuesta es **un solo motor de coordinación para el doble flujo producción–almacén**: lo llamamos NestLink. Es una capa de **coordinación y visibilidad** que atiende el reto — producto terminado hacia el almacén y materiales hacia las empaquetadoras — sobre **un mapa que respeta la realidad**: con muros físicos que ningún robot cruza y con peatones que la flota esquiva sin detener la producción.

¿Qué tecnología usa? **AMRs y vehículos autónomos** unificados bajo un **protocolo abierto (API/WebSocket)**: cualquier robot que publique posición y acepte una misión se integra, sin importar el fabricante. Encima corre una **IA de coordinación** — optimización de asignaciones, prioridades y recarga inteligente — y **analítica de datos con KPIs en tiempo real**. Separamos además la entrega: 5 robots de producción más un **AMR 6 exclusivo** que recorre una **ruta rosada** hasta el **muro externo**, con **cuatro puntos de salida en cuadrícula 2×2** controlados por estado.

¿Por qué es viable? Porque este MVP es un **simulador de decisión**: validamos reglas, KPIs y ahorros *antes* de tocar un robot real. Lo respaldan **89 tests automatizados** y corridas que verifican **cero paquetes atascados**, incluso con recargas forzadas.»

---

## Slide 4 · Demo 1 · Producción → OUT

«Vamos a la demo en vivo. **Materia prima entra por el este**; el sistema genera abastecimiento **preventivo** a las líneas — ojo que lo hace *antes* de que se vacíen, miren cómo sube el KPI de paradas evitadas.

Las **cuatro líneas procesan**, y cada pocos segundos sale un paquete de producción. Un AMR lo lleva a **paletizado** y luego la operación lo deja listo en uno de los **cuatro puntos de salida, en la cuadrícula 2×2**.

Miren esto *(señala el OUT)*: en cuanto llega un paquete, se enciende el **📦**. Ese emoji es el control de estado funcionando — el sistema *sabe* que hay producto esperando, no lo ignora.»

---

## Slide 5 · Demo 2 · AMR 6 y robustez

«Y ahora la parte que nos enorgullece. El **AMR 6** — nuestro robot de entrega exclusivo — ve el **📦**, lo recoge y lo lleva por la **ruta rosada** hasta el **muro externo**: es la zona de despacho hacia el almacén.

Fíjense en la **robustez**: si el AMR 6 tiene que ir a cargar batería en medio de una entrega, el paquete **no se pierde** — vuelve al buffer, y cuando el robot regresa, la entrega se reprograma sola. **Cero pérdidas.**

Y hay personas caminando por la planta: la flota las detecta, cede el paso y **re-rutea al instante** sin detener la producción. Ni un nodo ocupado deja un robot esperando sin salida.»

---

## Slide 6 · Eje 3 · Innovación

«¿Qué innovamos realmente? Tres cosas que hoy no existen en la operación.

**Primero**: el **mision control de estados por punto de salida**. Cada paquete que llega a un OUT se contabiliza y se le asigna y encadena automáticamente su misión de export. Esto elimina de raíz el problema crónico de los puntos de entrega que se bloquean "para siempre" — un fallo clásico de los sistemas de control de flota.

**Segundo**: la **entrega exclusiva con robustez ante batería**. Separar "producir" de "exportar" con un rol dedicado, y si ese rol debe cargar, **abortar la export sin perder el paquete**. Es tolerancia a fallos en operación, no en teoría.

**Tercero**: la **decisión sobre percepción real, con LiDAR**. El mapa y las rutas que ven *son* la percepción del robot, no un dibujo decorativo. Cierra el lazo dato → decisión.»

---

## Slide 7 · Eje 4 · Propuesta de valor

«¿Qué obtiene **Nestlé y sus operaciones** de aplicar esto? El reto pidió impacto en productividad, seguridad, recursos y costos — y **los medimos todos**, cada uno con su fuente de dato.

En **productividad**: más viajes completados y menor tiempo medio de entrega por misión. En **seguridad**: percepción continua con LiDAR, muros físicos y peatones esquivados — esto **reduce los riesgos del movimiento interno**: menos choques, menos cuellos de botella, menos intervención humana cerca de máquinas.

En **recursos**: menos kilómetros improductivos — la asignación elimina la **ida en vacío**, cerca del 45 por ciento del recorrido manual. Eso se ve en **km evitados y en el ROI de la flota**. En **costos y continuidad**: el abastecimiento **preventivo** evita paradas de línea, el mission control deja los puntos de salida siempre disponibles, y el **nuevo KPI de la ronda 2.8 — tiempo medio en OUT —** está en torno a un minuto y medio en nuestras referencias.

Y todo sobre **protocolo abierto**, que protege la inversión actual en robots. Esto no vende una máquina: vende **productividad, seguridad y eficiencia medidas** — más metros por hora de flota, menos riesgo y menos energía por pallet.»

---

## Slide 8 · Eje 5 · Sostenibilidad

«Y menos recorrido improductivo no es solo dinero — es **sostenibilidad operativa**, alineada con la meta **Net Zero 2050** de Nestlé y con el ODS 12 de producción responsable.

Primero, **menos energía por pallet movido**: cada kilómetro evitado es menos consumo de la flota y, con flota eléctrica, **menos ciclos de carga y más vida útil de baterías**.

Segundo, **menos residuos y retrabajo**: cero paquetes olvidados y cero entregas perdidas por recarga — menos reproceso, menos material descartado.

Tercero, **optimización del personal**: la gente deja de desbloquear robots y pasa a tareas de mayor valor, con menos esfuerzo físico y menor sobrecarga.

Y esto se mide: km evitados, paradas evitadas y tiempo en OUT son literalmente **recursos que no se desperdician** — energía, tiempo, capacidad — y se ven en vivo en el panel. Hacemos más pallets con **menos electricidad, menos horas y menos desperdicio**, con números, no con eslóganes.»

---

## Slide 9 · Eje 6 · Escalabilidad

«Nestlé tiene decenas de plantas, y esto fue diseñado para escalar desde el día uno.

**Primero**: un centro es **un mundo configurable** — layout, flota, ritmo de producción. Una planta nueva **no se reprograma: se configura**.

**Segundo**: **multi-centro desde un tablero central**. El mismo motor que hoy corre una simulación, mañana opera varias plantas a la vez.

**Tercero**: es **replicable por diseño** — la capa de decisión es agnóstica de hardware y el mapa se carga desde el layout real; la puesta en marcha en otro centro se acelera muchísimo.

Lo que hoy corre para una planta es **el mismo motor que mañana coordina un grupo de centros** desde un solo tablero.»

---

## Slide 10 · Cierre

«En una palabra: **NestLink convierte la logística interna en un sistema que se percibe, decide y coordina solo**. Una flota, un mapa, **cero viajes en vacío, cero paquetes atascados y menos energía por pallet** — con cada KPI respaldado por el simulador de decisión.

Hoy es un MVP de decisión sobre datos reales de planta. Mañana, es el cerebro que hace más eficiente y sostenible **cada centro Nestlé** desde un solo tablero.

**Muchas gracias — quedamos listos para sus preguntas.**»

---

## Slide 11 · Q&A

«(No se lee; modo respuesta.) Preguntas esperadas y cómo responder:

- **¿Cómo se conecta a hardware real / qué fabricantes?** — La lógica se expone por API/WebSocket; cualquier AMR que publique posición y acepte misión se integra. En la demo usamos LiDAR simulado para validar la capa de decisión antes del hardware.
- **¿Y si un robot se cae, pierde señal o va a cargar?** — El coordinador reasigna la misión a otro robot; si una entrega iba en vuelo y el AMR de entrega debe cargar, el paquete vuelve al buffer y se reprograma: cero pérdidas.
- **¿De dónde sale el ROI?** — De los km evitados: cada viaje sin pata vacía ahorra 45 % de su distancia (≈0.32 km/viaje). ROI = km evitados / (km recorridos + km evitados). Detalle completo en el Apéndice A.
- **¿Cómo lo implementamos en planta?** — Las reglas ya están validadas en el simulador; el mapa se carga del layout real; la puesta en marcha se acelera porque la capa de decisión es agnóstica de hardware.
- **¿Escala a varias plantas?** — Sí, cada planta es un mundo configurable y un tablero central opera varias.
- **¿Cómo se ve en sostenibilidad?** — Menos energía por pallet, menos ciclos de batería, cero desperdicio y personal liberado; todo medido en los KPIs.
- **¿Qué sigue tras el hackathon?** — Telemetría real vía MQTT/REST, gemelo digital con línea real, y piloto en una zona acotada de la planta.»

---

## Slide 12 · Apéndice A · Origen de los KPIs

«Déjenme mostrar que **nada de esto es inventado**: cada KPI nace del simulador de decisión y tiene fórmula y fuente.

El **tiempo medio de entrega** se mide en cada misión que se cierra: segundos de simulación entre crear la misión y terminarla. Las **paradas evitadas** cuentan cada disparo preventivo de abastecimiento antes de que una línea se vacíe. Los **km evitados** son la suma de cada viaje que se hace sin el tramo vacío — 0,32 km de referencia por viaje, y el 45 % que un montacargas manual haría sin carga. El **ROI** es km evitados sobre el total de kilómetros — coordinados más evitados. Y el **tiempo medio en OUT** mide desde que el paquete llega al punto de salida hasta que el AMR 6 lo coloca en el muro.

Todo se recalcula en vivo en cada tick, y está validado con la suite de **89 tests** y corridas por semilla: en nuestra referencia de 2500 ticks, **18 envíos medidos con tiempo medio en OUT de 1,53 minutos** y todos los puntos de salida vacíos al final.»

---

## Slide 13 · Apéndice B · Comparativa humano vs NestLink

«Y ya para cerrar, la pregunta de fondo: **¿qué ganamos frente al modelo humano**, la operación con montacargas y papeles?

En el modelo manual, solo cerca del **55 % de los kilómetros son productivos** — el resto es ida o vuelta en vacío. Los **puntos de entrega pueden olvidarse** y bloquearse para siempre. Con **NestLink**, la asignación consolida los viajes — **km productivo cerca del 100 %** — y el mission control por OUT garantiza **cero atascos**.

En lo operativo, si el montacargas se pausa o va a cargar, **se pierde la entrega en curso**; con NestLink, **cero pérdidas**, el paquete se devuelve y se reprograma. Las paradas de línea por falta de inventario, que hoy se detectan *cuando ya se paró*, con nosotros se **evitan por anticipación** — y las contamos.

Y la diferencia de fondo: en el modelo manual **no hay visibilidad**; con NestLink hay **KPIs en vivo**, incluido el tiempo en OUT. Por cada viaje consolidado, dejan de recorrerse unos **0,14 kilómetros de pata vacía**. Ese es el ROI, y esa es la eficiencia que se gana aplicando esta solución.»

---
*Lead: Aion CLI · alineado con `tasksR/pitch_deck/index.html` (13 slides) y `tasksR/pitch_5min.md` · demo default = realistic*
