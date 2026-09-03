// Configuración de vehículos, edge locking, sensores y lógica de movimiento

const nodeKeys = Object.keys(D.N);
const vehicles = [];
let vehId = 0;
let colisionesEvitadas = 0;
let rutasRecalculadas = 0;

// Spread vehicles across distinct, well-separated starting nodes
const usedStarts = [];
function pickSpawnNode() {
  // Try to find a node far from all already-used ones
  let bestNode = null, bestDist = -1;
  const candidates = [...nodeKeys].sort(() => Math.random() - 0.5);
  for (const nk of candidates) {
    const [nx, ny] = D.N[nk];
    let minD = Infinity;
    for (const un of usedStarts) {
      const [ux, uy] = D.N[un];
      minD = Math.min(minD, Math.hypot(nx - ux, ny - uy));
    }
    if (minD > bestDist) { bestDist = minD; bestNode = nk; }
  }
  usedStarts.push(bestNode);
  return bestNode;
}

for (const fi of D.F) {
  const cfg = D.V[fi.tipo];
  for (let i = 0; i < fi.cantidad; i++) {
    const startNode = pickSpawnNode();
    const [sx, sy] = D.N[startNode];
    vehicles.push({
      id: ++vehId,
      tipo: fi.tipo,
      color: cfg.c,
      label: cfg.l,
      vel: cfg.v,
      node: startNode,
      x: sx, y: sy,
      tx: sx, ty: sy,
      heading: 0,
      path: [],
      pathIdx: 0,
      waitUntil: 0,
      moving: false,
      moveEnd: 0,
      x0: sx, y0: sy,
      frenado: false,
      frenadoHasta: 0,
      esperaAcum: 0,
      _wasFrenadoPrev: false,
      lockedFrom: null,  // nodo origen del tramo reservado
      lockedTo: null,     // nodo destino del tramo reservado
      edgeBlocked: false, // esperando por tramo ocupado
      edgeWait: 0,        // tiempo acumulado esperando tramo
    });
  }
}

function pickTarget(v) {
  for (let i = 0; i < 30; i++) {
    const t = nodeKeys[Math.floor(Math.random() * nodeKeys.length)];
    if (t !== v.node) return t;
  }
  return nodeKeys[0];
}

// ── Bloqueo de aristas (edge locking) ──────────────────────
// Cada tramo solo admite un vehículo a la vez. Si otro ya lo
// ocupa, el vehículo espera o recalcula ruta.
const edgeLocks = {};  // key "min_max" → vehicleId
function edgeKey(a, b) { return a < b ? a + '|' + b : b + '|' + a; }
function tryLockEdge(a, b, vId) {
  const k = edgeKey(a, b);
  const occ = edgeLocks[k];
  if (occ === undefined || occ === vId) { edgeLocks[k] = vId; return true; }
  return false;
}
function unlockEdge(a, b, vId) {
  const k = edgeKey(a, b);
  if (edgeLocks[k] === vId) delete edgeLocks[k];
}
let tramosOcupados = 0;  // stat counter

// ── Sensor de proximidad ────────────────────────────────────
const SENSOR = { radioDeteccion: 3.0, radioFrenado: 1.8, tChequeo: 0.3, maxEspera: 8.0 };

// Priority rule: vehicle with LOWER id has right-of-way.
// A vehicle only brakes for vehicles that have priority over it (lower id).
// This prevents mutual deadlock — exactly one vehicle yields.
function vehiculoPrioritario(v) {
  let minD = Infinity, cercano = null;
  for (const o of vehicles) {
    if (o === v) continue;
    // Only yield to vehicles with lower id (they have priority)
    if (o.id >= v.id) continue;
    const d = Math.hypot(o.x - v.x, o.y - v.y);
    if (d < minD) { minD = d; cercano = o; }
  }
  return { cercano, dist: minD };
}

// Also check ALL vehicles (for stats/display), ignoring priority
function vehiculoCercanoAny(v) {
  let minD = Infinity, cercano = null;
  for (const o of vehicles) {
    if (o === v) continue;
    const d = Math.hypot(o.x - v.x, o.y - v.y);
    if (d < minD) { minD = d; cercano = o; }
  }
  return { cercano, dist: minD };
}

function releaseEdge(v) {
  if (v.lockedFrom !== null) {
    unlockEdge(v.lockedFrom, v.lockedTo, v.id);
    v.lockedFrom = null;
    v.lockedTo = null;
  }
}

function updateVehicle(v, t) {
  if (t < v.waitUntil) return;

  // Check proximity only to higher-priority vehicles (lower id)
  const { dist: distPrio } = vehiculoPrioritario(v);

  // ── Estado: frenado por sensor de proximidad ──
  if (v.frenado) {
    if (t < v.frenadoHasta) return;
    if (distPrio > SENSOR.radioFrenado) {
      v.frenado = false;
      v.esperaAcum = 0;
    } else if (v.esperaAcum >= SENSOR.maxEspera) {
      v.frenado = false;
      v.esperaAcum = 0;
      releaseEdge(v);
      v.path = [];
      v.pathIdx = 0;
      v.waitUntil = t + 0.5 + Math.random() * 1.5;
      rutasRecalculadas++;
      return;
    } else {
      v.esperaAcum += SENSOR.tChequeo;
      v.frenadoHasta = t + SENSOR.tChequeo;
      return;
    }
  }

  // ── Estado: esperando por tramo ocupado ──
  if (v.edgeBlocked) {
    if (v.edgeWait >= SENSOR.maxEspera) {
      // Demasiada espera → recalcular ruta
      v.edgeBlocked = false;
      v.edgeWait = 0;
      v.frenado = false;
      releaseEdge(v);
      v.path = [];
      v.pathIdx = 0;
      v.waitUntil = t + 0.5 + Math.random() * 1.5;
      rutasRecalculadas++;
      return;
    }
    // Intentar de nuevo reservar el tramo
    const nn = v.path[v.pathIdx];
    if (tryLockEdge(v.node, nn, v.id)) {
      v.lockedFrom = v.node;
      v.lockedTo = nn;
      v.edgeBlocked = false;
      v.frenado = false;
      v.edgeWait = 0;
      // Tramo libre, ahora avanzar (caerá al bloque de pathIdx)
    } else {
      v.edgeWait += SENSOR.tChequeo;
      v.frenado = true;
      v.frenadoHasta = t + SENSOR.tChequeo;
      if (!v._wasFrenadoPrev) { colisionesEvitadas++; tramosOcupados++; }
      return;
    }
  }

  // ── Estado: en movimiento ──
  if (v.moving) {
    if (distPrio < SENSOR.radioFrenado) {
      v.moving = false;
      v.frenado = true;
      v.esperaAcum = 0;
      v.frenadoHasta = t + SENSOR.tChequeo;
      if (!v._wasFrenadoPrev) colisionesEvitadas++;
      return;
    }

    const frac = v.moveEnd <= v._moveStart ? 1 : Math.min(1, (t - v._moveStart) / (v.moveEnd - v._moveStart));
    v.x = v.x0 + (v.tx - v.x0) * frac;
    v.y = v.y0 + (v.ty - v.y0) * frac;
    if (frac >= 1) {
      v.x = v.tx; v.y = v.ty;
      // Llegó al destino → liberar tramo
      releaseEdge(v);
      v.node = v.path[v.pathIdx];
      v.moving = false;
      v.pathIdx++;
    }
    return;
  }

  // ── Estado: listo para el siguiente nodo de la ruta ──
  if (v.pathIdx < v.path.length) {
    const nn = v.path[v.pathIdx];

    // 1) Intentar reservar tramo
    if (!tryLockEdge(v.node, nn, v.id)) {
      // Tramo ocupado → entrar en espera
      v.edgeBlocked = true;
      v.edgeWait = 0;
      v.frenado = true;
      v.frenadoHasta = t + SENSOR.tChequeo;
      if (!v._wasFrenadoPrev) { colisionesEvitadas++; tramosOcupados++; }
      return;
    }
    v.lockedFrom = v.node;
    v.lockedTo = nn;

    // 2) Sensor de proximidad
    if (distPrio < SENSOR.radioFrenado) {
      v.frenado = true;
      v.esperaAcum = 0;
      v.frenadoHasta = t + SENSOR.tChequeo;
      if (!v._wasFrenadoPrev) colisionesEvitadas++;
      return;
    }

    // 3) Avanzar
    const [nx, ny] = D.N[nn];
    const d = Math.hypot(nx - v.x, ny - v.y);
    if (d < 0.001) { releaseEdge(v); v.node = nn; v.pathIdx++; return; }
    const travel = d / v.vel;
    v.x0 = v.x; v.y0 = v.y;
    v.tx = nx; v.ty = ny;
    v._moveStart = t;
    v.moveEnd = t + travel;
    v.heading = Math.atan2(ny - v.y, nx - v.x);
    v.moving = true;
    return;
  }

  // ── Sin ruta → elegir nuevo destino ──
  const target = pickTarget(v);
  const path = astar(v.node, target);
  if (!path || path.length < 2) {
    v.waitUntil = t + 2;
    return;
  }
  v.path = path.slice(1);
  v.pathIdx = 0;
}

// ── Line states ─────────────────────────────────────────────
