# 🎤 Mini-Guion Pitch — NestLink · Hackathon InnoLabs Nestlé

> **Formato:** 5:00 cronometrado + 2:00 Q&A.
> **Demo:** planta REALISTIC (por defecto al arrancar), pantalla completa, LiDAR ON.
> **Mensaje central (one-liner):** «Convertimos una planta Nestlé en un score, y a sus AMRs en una flota que se coordina sola: cada rayo que ves recorriendo el piso es el LiDAR de un robot mapeando en tiempo real.»

---

## 0:00 – 0:40 · El problema (narrativa)

> *(Móntate cerca del mapa, señala la pantalla.)*

"En una planta Nestlé, mover materia prima, semielaborados y producto terminado es el corazón de la operación. Hoy eso se hace con AMRs de distintos fabricantes que **no hablan entre sí**: se bloquean en los pasillos, esperan sin salida, y nadie ve en tiempo real dónde está cada pallet.

Los costos ocultos no son las máquinas: son **las esperas, los choques virtuales y el tiempo perdido** de gente que debería estar en valor, no desbloqueando robots."

---

## 0:40 – 1:15 · La solución / arquitectura

> *(Pasa al mapa si aún no está en pantalla.)*

"NestLink es una **capa de coordinación y visibilidad** que unifica una flota heterogénea:

- **Un mapa vivo del piso**, dibujado desde el layout real.
- **Una flota unificada**: todos los AMRs se ven del mismo color, como una sola flota Nestlé.
- **Un cerebro que asigna misiones**, respeta a las personas que caminan por la planta, y **nunca deja un robot esperando para siempre**.

Y lo más importante para la demo: cuando un robot avanza, **lo que traza en el piso es su barrido LiDAR** — así es como percibe y navega su entorno en tiempo real."

---

## 1:15 – 3:15 · Demo en vivo (REALISTIC) 🚚✨

> *(Modo presentación, pantalla completa, zoom en el mapa. Cuenta mientras la sim corre.)*

"Esto que ven es nuestra planta 'realistic', corriendo en vivo" *(señala zonas)*:

1. **La materia prima entra por el este** → se generan pedidos de abastecimiento a las líneas.
2. **Las 4 líneas procesan el producto** → cada ~20 segundos un paquete sale de producción.
3. **Un AMR lo lleva a paletizado** *(señala la zona)* → el paquete se expide hacia **OUT, en el centro**, donde termina su recorrido.
4. Miran el **barrido cian**: cada línea trazada es el **LiDAR** del robot percibiendo el pasillo y re-planificando al instante.
5. **Hay personas caminando** *(señala peatones)*: la flota las detecta como obstáculos vivos y **re-rutea sin detener la producción**.

*Punto clave a decir mirando a los jueces:*
"Fíjense en esto: **ningún robot queda jamás esperando sin salida** — lo vimos en las rutas reales: si su nodo está ocupado, se repliega a un lugar seguro y se despeja solo." *(Referencia: fix de 'waiting forever'.)*

> *Tip timing: si la sim va lenta, sube la velocidad; el flujo SUPPLY→PICKUP_PT→EXPEDITION debe verse 1 ciclo completo antes de cortar.*
> *Números que podés leer del dashboard: viajes completados, paradas evitadas, km evitados.*

---

## 3:15 – 4:00 · Métricas / resultados

> *(Apunta al panel de KPIs.)*

"El MVP ya mide lo que importa para Nestlé:

- **Viajes completados** y **tiempo medio de entrega** por misión.
- **Paradas evitadas y km evitados** por la re-planificación dinámica — menos metros vacíos, menos energía.
- **ROI estimado de la flota** en porcentaje, con el que el área logística justifica la inversión.

Hablemos claro: estas son las métricas de nuestro **simulador de decisión**, validando las reglas antes de tocar un solo robot real en planta."

---

## 4:00 – 4:40 · Qué nos hace diferentes

"Tres diferenciales:

1. **Flota heterogénea unificada** — no reemplazamos AMRs, los hacemos trabajar juntos.
2. **Percepción real con LiDAR** — el mapa y las rutas que ustedes ven *son* la percepción del robot, no un dibujo bonito.
3. **Tolerancia a humanos** — una planta Nestlé está llena de gente; nuestro despacho convive con ella y **garantiza que nada se quede atascado para siempre**."

---

## 4:40 – 5:00 · Cierre

> *(Sube el tono, mirada a los jueces.)*

"En una palabra: **NestLink convierte la logística interna en un sistema que se percibe, se decide y se coordina solo** — con la marca Nestlé como una sola flota, un solo mapa y cero esperas ociosas.

Esto hoy es un MVP de decisión sobre datos reales de planta. Mañana, es el cerebro que corre más de una planta desde un solo tablero.

**Gracias — quedamos listos para sus preguntas.**" *(Corta la demo, deja el mapa en pantalla.)*

---

## 🎯 Q&A: preguntas difíciles y respuestas preparadas

**Q1 — "¿Cómo se conecta esto al hardware real? ¿Qué fabricantes?"**
R: La lógica de misión se expone vía API/WebSocket (protocolo abierto). Cualquier AMR que publique posición y acepte misión se integra; en el demo simulamos la percepción con el LiDAR para probar la capa de decisión antes de integrar hardware.

**Q2 — "¿Y si un AMR se cae o pierde señal?"**
R: El coordinador detecta inactividad, reasigna su misión a otro robot de la flota y el resto re-planifica. Es el caso que nos llevó a eliminar las 'esperas infinitas'.

**Q3 — "¿Cuánto tardaría en implementarse en una planta real?"**
R: Las reglas ya están validadas en el simulador. La integración por planta depende del fabricante del AMR; el mapa se carga desde el layout real, así que la puesta en marcha se acelera en gran medida.

**Q4 — "¿Escala a varias plantas?"**
R: Sí: cada planta es un 'mundo' configurable (layout + flota + seed). Un solo tablero central puede operar varias simulaciones y luego varias plantas.

**Q5 — "¿Qué sigue tras el hackathon?"**
R: (a) Ingesta de telemetría real vía MQTT/REST, (b) gemelo digital con la línea de producción real, (c) prueba piloto en una zona acotada de la planta.

---
*Lead: Aion CLI · última actualización 4-sep-2026 · demo default = realistic (commit cabeaa0)*
