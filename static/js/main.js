// Sidebar, controles UI y loop principal de animación

const vehListEl = document.getElementById('veh-list');
const lineListEl = document.getElementById('line-list');

function buildVehList() {
  vehListEl.innerHTML = '';
  for (const v of vehicles) {
    const row = document.createElement('div');
    row.className = 'veh-row';
    row.id = `vr-${v.id}`;
    row.innerHTML = `<div class="veh-dot" style="background:${v.color}"></div>
      <div class="veh-name">${v.tipo === 'amr_forklift' ? 'AMR' : 'TUG'}-${v.id}</div>
      <div class="veh-status" id="vs-${v.id}">—</div>`;
    vehListEl.appendChild(row);
  }
}

function buildLineList() {
  lineListEl.innerHTML = '';
  const names = ['Papas Fritas', 'Galletas', 'Snacks Extruidos'];
  const colors = ['#fee2e2', '#fce7f3', '#e0f2fe'];
  D.L.forEach((ln, i) => {
    const row = document.createElement('div');
    row.className = 'line-row';
    row.innerHTML = `<div class="line-chip" style="background:${colors[i]}"></div>
      <div class="line-name">${names[i]}</div>
      <div class="line-state" id="ls-${i}"></div>`;
    lineListEl.appendChild(row);
  });
}

function updateSidebar() {
  let active = 0, braking = 0;
  for (const v of vehicles) {
    const el = document.getElementById(`vs-${v.id}`);
    const row = document.getElementById(`vr-${v.id}`);
    if (v.frenado) {
      el.textContent = '⚠ FRENADO';
      el.style.color = 'var(--red)';
      row.classList.add('braking');
      braking++;
    } else if (v.moving) {
      el.textContent = `${v.vel} m/s`;
      el.style.color = 'var(--green)';
      row.classList.remove('braking');
      active++;
    } else if (simTime < v.waitUntil) {
      el.textContent = 'espera';
      el.style.color = 'var(--amber)';
      row.classList.remove('braking');
    } else {
      el.textContent = 'ruta…';
      el.style.color = 'var(--text3)';
      row.classList.remove('braking');
    }
    v._wasFrenadoPrev = v.frenado;
  }
  document.getElementById('veh-active').textContent = active;
  document.getElementById('veh-total').textContent = vehicles.length;
  document.getElementById('veh-braking').textContent = braking;
  document.getElementById('stat-evitadas').textContent = colisionesEvitadas;
  document.getElementById('stat-recalc').textContent = rutasRecalculadas;
  document.getElementById('stat-tramos').textContent = tramosOcupados;

  D.L.forEach((ln, i) => {
    const el = document.getElementById(`ls-${i}`);
    const st = lineStates[i].state;
    el.textContent = STATE_LABELS[st];
    el.className = 'line-state ' + STATE_CLS[st];
  });
}

buildVehList();
buildLineList();

// ── Controls ────────────────────────────────────────────────
document.getElementById('btn-pause').addEventListener('click', function() {
  paused = !paused;
  this.textContent = paused ? 'Play' : 'Pausa';
  this.classList.toggle('active', paused);
});
document.getElementById('btn-graph').addEventListener('click', function() {
  showGraph = !showGraph;
  this.classList.toggle('active', showGraph);
});
const speedSlider = document.getElementById('speed');
const speedValEl = document.getElementById('speed-val');
speedSlider.addEventListener('input', () => {
  speedMul = parseInt(speedSlider.value);
  speedValEl.textContent = speedMul + 'x';
});

// ── Main loop ───────────────────────────────────────────────
let lastFrame = null;
let sidebarCounter = 0;

function frame(ts) {
  if (lastFrame === null) lastFrame = ts;
  const dtReal = (ts - lastFrame) / 1000;
  lastFrame = ts;

  if (!paused) {
    const dtSim = dtReal * speedMul;
    simTime += dtSim;

    for (const v of vehicles) updateVehicle(v, simTime);
    updateLineStates(simTime);
  }

  render(simTime);

  document.getElementById('clock').textContent =
    `t = ${simTime.toFixed(1)} s  (${(simTime/3600).toFixed(2)} h)`;

  if (++sidebarCounter % 10 === 0) updateSidebar();

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
