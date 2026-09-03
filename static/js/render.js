// Estados de líneas de producción y renderizado del canvas

const STATES = ['PROD', 'BLOQ', 'HAMBRE', 'IDLE'];
const STATE_LABELS = { PROD: 'PROD', BLOQ: 'BLOQ', HAMBRE: 'HAMBRE', IDLE: 'IDLE' };
const STATE_CLS = { PROD: 'state-prod', BLOQ: 'state-block', HAMBRE: 'state-starve', IDLE: 'state-idle' };
const lineStates = D.L.map(() => ({ state: 'PROD', nextChange: Math.random() * 40 + 20 }));

function updateLineStates(t) {
  lineStates.forEach(ls => {
    if (t >= ls.nextChange) {
      ls.state = STATES[Math.floor(Math.random() * STATES.length)];
      ls.nextChange = t + 20 + Math.random() * 70;
    }
  });
}

// ── Canvas rendering ────────────────────────────────────────
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
let showGraph = false;
let paused = false;
let speedMul = 5;
let simTime = 0;

function resize() {
  const r = cv.parentElement.getBoundingClientRect();
  const sideW = 220;
  cv.width = (r.width - sideW) * devicePixelRatio;
  cv.height = r.height * devicePixelRatio;
  cv.style.width = (r.width - sideW) + 'px';
  cv.style.height = r.height + 'px';
}
resize();
window.addEventListener('resize', resize);

function getScale() {
  const pad = 20;
  const cw = cv.width / devicePixelRatio;
  const ch = cv.height / devicePixelRatio;
  const sx = (cw - pad * 2) / D.W;
  const sy = (ch - pad * 2) / D.H;
  const s = Math.min(sx, sy);
  const ox = pad + (cw - pad * 2 - D.W * s) / 2;
  const oy = pad + (ch - pad * 2 - D.H * s) / 2;
  return { s, ox, oy };
}

function toCanvas(px, py) {
  const { s, ox, oy } = getScale();
  return [ox + px * s, (cv.height / devicePixelRatio) - oy - py * s];
}

function drawRect(x, y, w, h, fill, stroke) {
  const { s } = getScale();
  const [cx, cy] = toCanvas(x, y + h);
  ctx.fillStyle = fill;
  if (fill !== 'none') ctx.fillRect(cx, cy, w * s, h * s);
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 0.5;
    ctx.strokeRect(cx, cy, w * s, h * s);
  }
}

function drawText(text, x, y, size, color, align) {
  const { s } = getScale();
  const [cx, cy] = toCanvas(x, y);
  ctx.fillStyle = color;
  ctx.font = `500 ${Math.max(8, size * s)}px Inter, sans-serif`;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy);
}

function drawHatch(x, y, w, h, color) {
  const { s } = getScale();
  const [cx, cy] = toCanvas(x, y + h);
  const pw = w * s, ph = h * s;
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx, cy, pw, ph);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.4;
  const step = 3;
  for (let i = -ph; i < pw + ph; i += step) {
    ctx.beginPath();
    ctx.moveTo(cx + i, cy);
    ctx.lineTo(cx + i + ph, cy + ph);
    ctx.stroke();
  }
  ctx.restore();
}

function render(t) {
  const dpr = devicePixelRatio;
  const cw = cv.width / dpr;
  const ch = cv.height / dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cw, ch);

  const { s } = getScale();
  const isDark = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim().startsWith('#0');

  // Plant background
  const [bx, by] = toCanvas(0, D.H);
  ctx.fillStyle = isDark ? '#1e2330' : '#fafbfd';
  ctx.fillRect(bx, by, D.W * s, D.H * s);
  ctx.strokeStyle = isDark ? '#2e3648' : '#d0d4dc';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, D.W * s, D.H * s);

  // Zones
  for (const z of D.Z) {
    const [label, zx, zy, zw, zh, color] = z;
    if (color === 'none') continue;
    let c = color;
    if (isDark) {
      const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
      c = `rgba(${Math.floor(r*0.3)},${Math.floor(g*0.3)},${Math.floor(b*0.35)},0.7)`;
    }
    drawRect(zx, zy, zw, zh, c);
  }

  // Zone labels
  for (const z of D.Z) {
    const [label, zx, zy, zw, zh] = z;
    if (!label) continue;
    const textColor = isDark ? '#c8cdd8' : '#374151';
    drawText(label, zx + zw / 2, zy + zh / 2, 1.2, textColor, 'center');
  }

  // Corridor
  const corrX = D.C.x, corrW = D.C.w;
  const corrColor = isDark ? 'rgba(100,120,160,0.08)' : 'rgba(148,163,184,0.12)';
  drawRect(corrX, 0, corrW, D.H, corrColor);

  // Rack hatching
  for (const z of D.Z) {
    const [label, zx, zy, zw, zh, color] = z;
    if (color === '#fef9c3' || color === '#dbeafe' || color === '#dcfce7') {
      const hc = isDark ? 'rgba(180,160,80,0.25)' : 'rgba(180,160,60,0.3)';
      if (color === '#dbeafe') drawHatch(zx, zy, zw, zh, isDark ? 'rgba(100,140,220,0.25)' : 'rgba(80,120,200,0.25)');
      else if (color === '#dcfce7') drawHatch(zx, zy, zw, zh, isDark ? 'rgba(80,180,100,0.25)' : 'rgba(60,160,80,0.25)');
      else drawHatch(zx, zy, zw, zh, hc);
    }
  }

  // Line state indicators
  const stateColors = {
    PROD: isDark ? '#22c55e' : '#16a34a',
    BLOQ: isDark ? '#f59e0b' : '#d97706',
    HAMBRE: isDark ? '#ef4444' : '#dc2626',
    IDLE: isDark ? '#64748b' : '#94a3b8'
  };
  D.L.forEach((ln, i) => {
    const h = ln.yt - ln.yb;
    const sx2 = ln.x - 1.8;
    drawRect(sx2, ln.yb, 1.2, h, stateColors[lineStates[i].state]);
  });

  // Graph overlay
  if (showGraph) {
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = isDark ? '#ef4444' : '#dc2626';
    ctx.lineWidth = 1;
    for (const [u, v] of D.E) {
      const [ux, uy] = toCanvas(...D.N[u]);
      const [vx, vy] = toCanvas(...D.N[v]);
      ctx.beginPath();
      ctx.moveTo(ux, uy);
      ctx.lineTo(vx, vy);
      ctx.stroke();
    }
    ctx.fillStyle = isDark ? '#fca5a5' : '#991b1b';
    for (const n of Object.keys(D.N)) {
      const [nx, ny] = toCanvas(...D.N[n]);
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Locked edges highlight — shows which segments are reserved
  ctx.lineWidth = Math.max(3, 1.5 * s);
  for (const k of Object.keys(edgeLocks)) {
    const [a, b] = k.split('|');
    if (!D.N[a] || !D.N[b]) continue;
    const [ax, ay] = toCanvas(...D.N[a]);
    const [bx, by] = toCanvas(...D.N[b]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = isDark ? 'rgba(239,68,68,0.35)' : 'rgba(220,38,38,0.3)';
    ctx.stroke();
  }

  // Vehicles
  const vSize = Math.max(4, 2.0 * s);
  const sensorRingR = SENSOR.radioDeteccion * s;
  for (const v of vehicles) {
    const [vx, vy] = toCanvas(v.x, v.y);

    // Sensor detection ring (visible when braking)
    if (v.frenado) {
      // Pulsating outer ring
      const pulse = 0.85 + 0.15 * Math.sin(t * 6);
      ctx.beginPath();
      ctx.arc(vx, vy, sensorRingR * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? `rgba(239,68,68,${0.3 * pulse})` : `rgba(220,38,38,${0.25 * pulse})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Inner danger zone fill
      const brakeR = SENSOR.radioFrenado * s;
      ctx.beginPath();
      ctx.arc(vx, vy, brakeR, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? 'rgba(239,68,68,0.1)' : 'rgba(220,38,38,0.08)';
      ctx.fill();
      ctx.strokeStyle = isDark ? 'rgba(239,68,68,0.4)' : 'rgba(220,38,38,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Draw path preview for moving vehicles
    if (v.path.length > 0 && v.pathIdx < v.path.length) {
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      for (let pi = v.pathIdx; pi < v.path.length; pi++) {
        const [npx, npy] = toCanvas(...D.N[v.path[pi]]);
        ctx.lineTo(npx, npy);
      }
      ctx.strokeStyle = v.frenado
        ? (isDark ? 'rgba(239,68,68,0.2)' : 'rgba(220,38,38,0.15)')
        : (v.tipo === 'amr_forklift'
          ? (isDark ? 'rgba(59,111,245,0.2)' : 'rgba(30,64,175,0.15)')
          : (isDark ? 'rgba(144,85,232,0.2)' : 'rgba(109,40,217,0.15)'));
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.save();
    ctx.translate(vx, vy);
    ctx.rotate(-v.heading);

    // Triangle — red when braking
    ctx.fillStyle = v.frenado ? '#ef4444' : v.color;
    ctx.beginPath();
    ctx.moveTo(vSize * 1.3, 0);
    ctx.lineTo(-vSize * 0.9, -vSize * 0.75);
    ctx.lineTo(-vSize * 0.9, vSize * 0.75);
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = v.frenado ? '#fca5a5' : (isDark ? 'rgba(255,255,255,0.7)' : '#ffffff');
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();

    // Label
    const prefix = v.frenado ? '⚠ ' : '';
    const lbl = `${prefix}${v.tipo === 'amr_forklift' ? 'AMR' : 'TUG'}-${v.id}`;
    ctx.fillStyle = v.frenado ? '#ef4444' : (isDark ? '#c8cdd8' : '#1e293b');
    ctx.font = `600 ${Math.max(8, 0.8 * s)}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(lbl, vx + vSize + 3, vy - 3);
  }
}

// ── Sidebar ─────────────────────────────────────────────────
