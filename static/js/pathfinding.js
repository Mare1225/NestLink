// Construcción del grafo de adyacencia y algoritmo A*

const adj = {};
for (const n of Object.keys(D.N)) adj[n] = [];
for (const [u, v, w] of D.E) {
  adj[u].push({ to: v, w });
  adj[v].push({ to: u, w });
}

function heuristic(a, b) {
  const [ax, ay] = D.N[a], [bx, by] = D.N[b];
  return Math.hypot(bx - ax, by - ay);
}

function astar(start, goal) {
  if (start === goal) return [start];
  const g = {}, f = {}, prev = {};
  g[start] = 0;
  f[start] = heuristic(start, goal);
  const open = new Set([start]);
  const closed = new Set();

  while (open.size > 0) {
    let cur = null, best = Infinity;
    for (const n of open) { if (f[n] < best) { best = f[n]; cur = n; } }
    if (cur === goal) {
      const path = []; let c = goal;
      while (c) { path.unshift(c); c = prev[c]; }
      return path;
    }
    open.delete(cur);
    closed.add(cur);
    for (const { to, w } of adj[cur]) {
      if (closed.has(to)) continue;
      const ng = g[cur] + w;
      if (ng < (g[to] ?? Infinity)) {
        g[to] = ng;
        f[to] = ng + heuristic(to, goal);
        prev[to] = cur;
        open.add(to);
      }
    }
  }
  return null;
}

// ── Vehicle simulation ──────────────────────────────────────
