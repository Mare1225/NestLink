# 📋 Runbook / Checklist — Live-day Demo NestLink (Reto 1)

> **Demo:** jueves 4-sep · 18:30 · Salón Azul USFQ · **Pitch 5:00 cronometrado + 2:00 Q&A**
> **Planta del demo:** `realistic` (default al arrancar el stack) · guion en `tasksR/pitch_5min.md`
> **Stack:** Docker Compose (`compose.yml`) · backend FastAPI `:8000` · frontend Next.js `:3000`
> **Mensaje central:** «Convertimos una planta Nestlé en un score, y a sus AMRs en una flota que se coordina sola: cada rayo que ves recorriendo el piso es el LiDAR de un robot mapeando en tiempo real.»

---

## 0) Resumen en una pantalla

| Qué | Dónde / Cómo | Señal de éxito |
|---|---|---|
| Backend | `http://localhost:8000` (`/docs`, `/health`) | `/health` → `plant:"realistic"`, `sim_running:true` |
| Frontend | `http://localhost:3000` | Mapa "Planta Realistic", 5 AMRs rojos, 📡 LiDAR ON |
| Misiones | Kanban + `/api/v1/missions` | Ciclo `SUPPLY_REQUEST → PICKUP_PT → EXPEDITION → OUT` |
| KPIs | Panel superior + `/api/v1/metrics` | `viajes_completados` creciendo, `paradas_evitadas`, `roi_km_pct` |

---

## 1) Pre-requisitos (antes de las 18:00)

- [ ] Repo en rama `JoshR` con los últimos commits del 4-sep (`cabeaa0` default realistic, `2290d01` flujo paquete, `b5b377b` muros). *El lead valida/commitea/pushea; hacer `git pull` si hace falta.*
- [ ] Docker Desktop **corriendo** (`docker --version` OK).
- [ ] Puertos `8000` y `3000` libres (ver §6 si están ocupados).
- [ ] Ningún `.env.local` con URLs raras: usar `http://localhost:8000` / `ws://localhost:8000/ws` (build ARGs del frontend).

---

## 2) Arranque del stack Docker (run book)

```bash
cd /Users/joshuareinoso/Desktop/Proyect/NestLink

# A) Arranque normal (usa imágenes ya construidas — rápido)
docker compose up -d

# B) Arranque con rebuild (recomendado si cambió código backend o frontend)
docker compose up --build -d
```

- [ ] Esperar a que el healthcheck pase (10 s): `docker compose ps` → `api` en estado `(healthy)`.
- [ ] Ver logs sin errores: `docker compose logs -f api` (parar con `Ctrl+C`).

> ⚠️ `NEXT_PUBLIC_*` son build-time ARGs del frontend: si cambian, **siempre** `--build`.

**Tear-down (después de ensayar):**
```bash
docker compose down        # baja sin borrar imágenes
docker compose down -v     # solo si se quiere limpieza total
```

---

## 3) Verificación del default `realistic` (post-arranque)

| # | Comando / Acción | Esperado |
|---|---|---|
| 1 | `curl -s http://localhost:8000/health` | `"plant":"realistic"` y `"sim_running":true` |
| 2 | `curl -s http://localhost:8000/api/v1/layout` | `canvas.title == "Planta Realistic — NestLink"`, **75 nodos**, 90 aristas, existe nodo `OUT`, 2 muros (`walls`) |
| 3 | `curl -s http://localhost:8000/api/v1/fleet` | 5 AMRs: `AMR_01 … AMR_05` |
| 4 | Abrir `http://localhost:3000` | Header «Planta Realistic», mapa con zonas (Línea de producción / Materia Prima / Paletizado / OUT), AMRs **rojos unificados** `#E4032E`, toggle 📡 **LiDAR ON** (default en realistic) |
| 5 | `curl -s http://localhost:8000/api/v1/missions` | Deben verse `SUPPLY_REQUEST`, `PICKUP_PT` y `EXPEDITION` (ciclo paquete vivo) |
| 6 | `curl -s http://localhost:8000/api/v1/metrics` | `viajes_completados > 0` y creciendo |

> ✅ Verificado en vivo (pre-demo): missions `15 SUPPLY_REQUEST + 12 PICKUP_PT + 9 EXPEDITION`, `viajes_completados=29`, `paradas_evitadas=4`, `roi_km_pct=31.0`.

---

## 4) Orden de la demo (0:00–5:00 · según `tasksR/pitch_5min.md`)

> Modo presentación: navegador a pantalla completa (`F11` / `Cmd+Shift+F`), zoom 100%, LiDAR ON.

| Minuto | Qué decir (resumen) | Acción en pantalla |
|---|---|---|
| **0:00–0:40** | El problema: AMRs de distintos fabricantes que no hablan entre sí → esperas, choques virtuales, gente desbloqueando robots. | Slide inicial / narrativa junto al mapa. |
| **0:40–1:15** | La solución: capa de coordinación y visibilidad — mapa vivo, flota unificada, cerebro que asigna misiones y nunca deja un robot esperando forever. | Señalar zonas del mapa. |
| **1:15–3:15** | **Demo en vivo (REALISTIC):** 1) MP entra por el este → SUPPLY_REQUEST a líneas. 2) 4 líneas procesan → cada ~20 s sale un paquete. 3) AMR lo lleva a **Paletizado**. 4) Se expide a **OUT (centro)** → fin del recorrido. 5) Barrido **LiDAR cian** = percepción real. 6) Peatones → re-ruteo sin parar producción. | Fullscreen, zoom al mapa; señalar el ciclo SUPPLY→PICKUP_PT→EXPEDITION en el kanban; «ningún robot espera sin salida». |
| **3:15–4:00** | Métricas: viajes completados, tiempo medio de entrega, paradas/km evitados, ROI estimado de flota. | Apuntar al panel de KPIs. |
| **4:00–4:40** | Diferenciales: flota heterogénea unificada, percepción real con LiDAR, tolerancia a humanos. | Mapa en pantalla. |
| **4:40–5:00** | Cierre: «NestLink convierte la logística interna en un sistema que se percibe, se decide y se coordina solo». | Cortar demo, dejar el mapa en pantalla. |
| **+Q&A** | 5 preguntas preparadas (hardware real, AMR caído, tiempo de implementación, multi-planta, qué sigue). | Responder con `pitch_5min.md` §Q&A. |

> **Tip timing:** si la sim va lenta, sube la velocidad; **deja que se vea 1 ciclo completo** SUPPLY→PICKUP_PT→EXPEDITION antes de cortar. Números a leer del dashboard: viajes completados, paradas evitadas, km evitados.

---

## 5) Contingencia / Plan B

### 5.1 El backend no reporta `realistic` (imagen vieja / otra planta activa)
```bash
# Forzar planta realistic al vuelo (sin rebuild)
curl -s -X POST http://localhost:8000/api/v1/sim/select \
  -H 'Content-Type: application/json' -d '{"plant":"realistic"}'
# → {"status":"ok","plant":"realistic"}
```
Y en el frontend: usar el **selector de planta** del dashboard (elegir «Planta Realistic») o recargar `F5`.

### 5.2 No aparece el ciclo del paquete (sin PICKUP_PT / EXPEDITION / OUT)
- Confirmar que el backend corre el código del flujo: `curl -s http://localhost:8000/api/v1/missions` → buscar `PICKUP_PT` y `EXPEDITION`.
- Confirmar que el layout tiene `OUT`: `curl -s http://localhost:8000/api/v1/layout | grep -o '"id": "OUT"'`.
- Si falta → el contenedor usa una imagen vieja: **rebuild**:
  ```bash
  docker compose up --build -d
  ```
- Recordar: cada línea genera un PICKUP_PT cada ~20 s simulados (~5 s reales a 4×); darle 30–60 s de corrida si recién arrancó.

### 5.3 Frontend no conecta (offline / WS no se conecta)
1. Verificar api healthy (§3).
2. Recargar la página (`F5`). Si persiste: `docker compose restart web`.
3. Último recurso: **modo offline** del frontend (demoEngine client-side) con `Ctrl+Shift+D` — los botones de demo funcionan igual.

### 5.4 Puertos ocupados (`8000` / `3000`)
```bash
lsof -ti:8000,3000 | xargs kill -9 2>/dev/null || true
docker compose up -d
```
*(Solo matar procesos propios/duplicados.)*

### 5.5 Docker no disponible (plan C — modo local)
```bash
# Backend
cd backend && python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
# Frontend (otra terminal)
cd frontend && npm install && npm run dev
```

---

## 6) Checklist pre-presentación (últimos 15 min)

- [ ] Stack arriba y `/health` con `plant:"realistic"`, `sim_running:true`.
- [ ] Web `http://localhost:3000` HTTP 200; mapa realistic, AMRs rojos, LiDAR ON, peatones patrullando.
- [ ] Misiones muestran al menos 1 ciclo `SUPPLY → PICKUP_PT → EXPEDITION` (si no, dejar correr 1–2 min).
- [ ] KPIs con `viajes_completados` creciendo.
- [ ] Botones demo probados (rápido): **Inyectar Pico**, **Rellenar 80%**, **🔋 15% Batería**, **Derrame** (opcional según tiempo).
- [ ] Pantalla 16:9 (1920×1080 o 1440×900), zoom navegador 100%, sin scroll vertical.
- [ ] Suspensión de pantalla **off** y **No Molestar** ON en la MacBook de presentación.
- [ ] Roles definidos: quién narra + quién maneja el ratón.
- [ ] Copia local de `pitch_5min.md` abierta como guion.

---

## 7) Referencias

- Guion del pitch + Q&A: `tasksR/pitch_5min.md`
- Plan de la ronda realistic / checklist vivo: `tasksR/plan_realistic.md`
- Estado de bugs y tareas: `tasksR/Tasks_&_Bugs.md`
- Guía operativa + demo extendida + Plan B offline: `docs/GUIA_EJECUCION_Y_DEMO.md`
- Contrato API/WS: `docs/API_CONTRATO.md` · Arranque local/README: `README.md`
- Flujo de negocio del paquete (backend): `backend/app/sim/generators.py` (20 s → PICKUP_PT) y `backend/app/sim/agents.py` (EXPEDITION WH_PT→OUT, fin del recorrido).

---
*Runbook generado por Deep · 4-sep-2026 · demo default = realistic (commit cabeaa0) · validado en vivo (stack arriba, /health plant:"realistic", ciclo paquete activo).*
