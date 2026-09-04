#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
convert_huge.py — Port reproducible del mapa industrial de Mare (data.js)
al formato de layout/seed de NestLink, registrando la planta "huge".

Uso:
    cd backend
    python3 scripts/convert_huge.py
    # emite ./app/data/maps/huge.json  y  ./app/data/seeds/seed_huge.json

Criterios de diseño (documentados):
  * type por nomenclatura de nodo: wh_*/pa_* → "almacen"; abast_* → "linea";
    fin_* → "empacadora"; buf_* → "buffer"; corr_/east_/mid_/h_/otras → "cruce".
  * UNIDIRECCIONALES SEGUROS: solo los pasillos verticales INTERIORES de racks
    (ambos extremos contienen "wh_w_", alineados en X, adyacentes en Y),
    orientados de menor Y (entrada) a mayor Y (interior). El regreso siempre
    queda garantizado por el 'storefront' bi (pa_*_in/out → corredor east_*) y
    por el enlace wh_w_nivel0 → corr_*. Todo lo demás es bidireccional.
  * Guarda automática: tras generar, se verifica que desde CADA posicion de AMR
    (y cada cargador) se alcanzan TODOS los nodos de operación
    (almacen/linea/empacadora/buffer/carga). Si algún aisle uni rompe la
    alcanzabilidad, se revierte a bidireccional (log "UNI_FLIP").
  * Nodos alias requeridos por el core NestLink (bootstrap de env.py y el
    generador de demanda hardcodean WH_MP_*/WH_PT_*/L*_OUT/E*_IN):
    WH_MP_1..5, WH_PT_1..3, L1_OUT..L3_OUT, E1_IN, E2_IN, + carga CHARGER_HUGE_1..3.
"""
import json
import math
import os
import re
import sys

import networkx as nx

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.dirname(HERE)
DATA_JS = os.path.join(os.path.dirname(os.path.dirname(BACKEND)), "_referencia_mapa_industrial_NestLink.js")  # ~/Desktop/Proyect/
MAPS_DIR = os.path.join(BACKEND, "app", "data", "maps")
SEEDS_DIR = os.path.join(BACKEND, "app", "data", "seeds")


def load_mare(path: str) -> dict:
    src = open(path, encoding="utf-8").read()
    body = re.search(r"const D\s*=\s*(\{.*\});", src, re.S).group(1)
    body = re.sub(r"([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', body)
    return json.loads(body)


def classify(node_id: str) -> str:
    if node_id.startswith("buf_"):
        return "buffer"
    if node_id.startswith("wh_") or node_id.startswith("pa_"):
        return "almacen"
    if node_id.startswith("abast_"):
        return "linea"
    if node_id.startswith("fin_"):
        return "empacadora"
    return "cruce"


def label_of(node_id: str) -> str:
    base = node_id
    for pre in ("mid_", "corr_", "east_", "h_", "wh_", "pa_", "abast_", "fin_", "buf_", "prod_", "oeste_", "norte_", "sur_"):
        if base.startswith(pre):
            base = base[len(pre):]
            break
    words = re.sub(r"[_]+", " ", base).strip()
    return words[:18] if words else node_id[:18]


def dist_ok(ax, bx):  # alineados verticalmente (mismo pasillo interior de rack)
    return abs(ax - bx) < 0.5


def _round(v, nd=2):
    return round(float(v), nd)


def build(loads: bool = True):
    D = load_mare(DATA_JS)
    N = D["N"]          # {id: [x, y]}
    E = D["E"]          # [ [from, to, weight] ]
    Z = D["Z"]          # [ [label, x, y, w, h, color] ]
    L = D.get("L", [])  # lineas de produccion

    nodes = [{"id": nid, "x": _round(xy[0]), "y": _round(xy[1]), "type": classify(nid),
              "label": label_of(nid)} for nid, xy in N.items()]
    by_id = {n["id"]: n for n in nodes}

    pos = {nid: (float(xy[0]), float(xy[1])) for nid, xy in N.items()}

    # --- aristas base bi + aisles uni (solo interior de racks) ---
    seen = set()
    edges = []
    uni_log = []
    for u, v, w in E:
        key = frozenset((u, v))
        if key in seen:
            continue
        seen.add(key)
        length = _round(w)
        xu, yu = pos.get(u, (0, 0)); xv, yv = pos.get(v, (0, 0))
        direction = "bi"
        # candidato uni: ambos INTERIORES de rack (contienen wh_w_) y alineados en X
        if ("wh_w_" in u and "wh_w_" in v) and dist_ok(xu, xv) and abs(yu - yv) < 9.0:
            direction = "uni"
            uni_log.append((u, v))
            # orientar de menor Y (entrada) a mayor Y (interior)
            if yu > yv:
                u, v = v, u
        edges.append({"from": u, "to": v, "length": length, "max_speed": 1.5,
                      "direction": direction, "blocked": False})

    # --- zonas ---
    zones = [{"label": (z[0] if z[0] != "none" else ""), "x": _round(z[1]), "y": _round(z[2]),
              "w": _round(z[3]), "h": _round(z[4]),
              "color": (z[5] if z[5] not in ("none", "") else "")} for z in Z]

    # --- lines / buffers ---
    lines = []
    for ln in L:
        lid = ln.get("id", "")
        buf_ids = sorted([k for k in N if k.startswith("buf_" + lid + "_")], key=lambda k: N[k][1])
        lines.append({
            "id": lid,
            "nombre": ln.get("p", lid), "color": ln.get("c", "#888"),
            "x": _round(ln.get("x", 0)), "y": _round(ln.get("yc", ln.get("yt", 0))),
            "w": _round(ln.get("w", 10)), "h": round(abs(ln.get("yt", 0) - ln.get("yb", 0)), 2),
            "buffer_nodes": buf_ids,
        })

    # --- nodos alias (requeridos por el core) + cargadores ---
    def add_alias(nid, anchor, dx, dy, ntype, label=None):
        ax, ay = pos[anchor]
        pos[nid] = (ax + dx, ay + dy)
        nodes.append({"id": nid, "x": _round(ax + dx), "y": _round(ay + dy),
                      "type": ntype, "label": label or nid})
        d = math.hypot(dx, dy)
        edges.append({"from": nid, "to": anchor, "length": _round(d), "max_speed": 1.5,
                      "direction": "bi", "blocked": False})
        return nid

    # Almacenes de materias primas (5) pegados a los racks secos/insumos
    anchors_mp = [("wh_w_secos_0", "WH_MP_1"), ("wh_w_secos_1", "WH_MP_2"),
                  ("wh_w_secos_2", "WH_MP_3"), ("wh_w_insumos_empaque_0", "WH_MP_4"),
                  ("wh_w_insumos_empaque_1", "WH_MP_5")]
    for anchor, aid in anchors_mp:
        if anchor in pos:
            add_alias(aid, anchor, -4.0, 0.0, "almacen", aid.replace("_", " "))

    # Producto terminado (3): storefront de cada fin de linea
    for fin, pid in [("fin_linea1", "WH_PT_1"), ("fin_linea2", "WH_PT_2"), ("fin_linea3", "WH_PT_3")]:
        if fin in pos:
            add_alias(pid, fin, 4.0, 0.0, "almacen", pid.replace("_", " "))

    # L*_OUT (destino de SUPPLY) junto al paletizado de cada linea
    for ab, lid in [("abast_linea1_paletizado", "L1_OUT"), ("abast_linea2_paletizado", "L2_OUT"),
                    ("abast_linea3_paletizado", "L3_OUT")]:
        if ab in pos:
            add_alias(lid, ab, 4.5, 0.0, "linea", "Línea " + lid[1:2] + " SUPPLY")

    # Insumos de empaque (E1_IN / E2_IN) junto a almacén de insumos
    for anchor, eid in [("wh_w_insumos_empaque_0", "E1_IN"), ("wh_w_insumos_empaque_1", "E2_IN")]:
        if anchor in pos:
            add_alias(eid, anchor, 4.0, 0.0, "linea", eid.replace("_", " "))

    # Cargadores en corredores (3)
    for cid, anchor, dx, dy in [("CHARGER_HUGE_1", "corr_0.00", -4.0, 0.0),
                                ("CHARGER_HUGE_2", "east_0.00", -4.0, 0.0),
                                ("CHARGER_HUGE_3", "corr_47.10", -4.0, 0.0)]:
        if anchor in pos:
            add_alias(cid, anchor, dx, dy, "carga", "Cargador")

    # --- pedestrians de ejemplo sobre corredores reales ---
    corr_nodes = sorted([k for k in N if k.startswith("corr_")], key=lambda k: N[k][1])
    east_nodes = sorted([k for k in N if k.startswith("east_")], key=lambda k: N[k][1])
    fin_nodes = [k for k in N if k.startswith("fin_")]
    pedestrians = []
    if len(corr_nodes) >= 2:
        wp = corr_nodes[:2] + corr_nodes[-2:] + [corr_nodes[0]]
        pedestrians.append({"id": "PED_01", "name": "Operario Andrés (Muelle insumos)",
                            "waypoints": wp, "speed": 1.0, "radius": 2.5})
    if len(east_nodes) >= 2:
        wp = east_nodes[:2] + east_nodes[-2:] + [east_nodes[0]]
        pedestrians.append({"id": "PED_02", "name": "Operario María (PT)", "waypoints": wp,
                            "speed": 1.0, "radius": 2.5})
    if fin_nodes:
        pedestrians.append({"id": "PED_03", "name": "Supervisor líneas",
                            "waypoints": fin_nodes + [fin_nodes[0]], "speed": 1.2, "radius": 2.5})

    layout = {
        "canvas": {"w": 120, "h": 80, "title": "Planta Huge — Gemelo Intralogístico NestLink"},
        "nodes": nodes,
        "edges": edges,
        "zones": zones,
        "lines": lines,
        "pedestrians": pedestrians,
    }

    # ==================== GUARDA DE ALCANZABILIDAD ====================
    G = nx.DiGraph()
    for e in edges:
        if e["direction"] == "bi":
            G.add_edge(e["from"], e["to"], length=e["length"])
            G.add_edge(e["to"], e["from"], length=e["length"])
        else:
            G.add_edge(e["from"], e["to"], length=e["length"])

    amr_starts = ["CHARGER_HUGE_1", "CHARGER_HUGE_2", "CHARGER_HUGE_3",
                  "corr_12.00", "fin_linea1", "buf_linea2_0"]
    op_types = {"almacen", "linea", "empacadora", "buffer", "carga"}

    def ops():
        return [n["id"] for n in nodes if n["type"] in op_types]

    uni_edges = [e for e in edges if e["direction"] == "uni"]
    flipped = []
    for _ in range(120):
        bad = []
        for s in amr_starts:
            if s not in G:
                continue
            reach = nx.descendants(G, s)
            for o in ops():
                if o not in G.nodes:
                    continue
                if o != s and o not in reach:
                    bad.append((s, o))
        if not bad:
            break
        # revertir el aisle uni que toca un nodo inalcanzable (o en su frontera)
        target_ops = {o for _, o in bad}
        cand = [e for e in uni_edges if e not in flipped and (e["to"] in target_ops or e["from"] in target_ops)]
        if not cand:
            break
        e = cand[0]
        e["direction"] = "bi"
        flipped.append(e)
        if e["from"] in G and e["to"] in G:
            G.add_edge(e["to"], e["from"], length=e["length"])
    print("[convert_huge] UNI_FLIP revertidos a bi:", len(flipped), "->", [(e['from'], e['to']) for e in flipped[:6]])

    # assert nodos requeridos por env.py (bootstrap) existen
    required = ["WH_MP_1", "WH_MP_2", "WH_MP_3", "WH_MP_4", "WH_MP_5",
                "WH_PT_1", "WH_PT_2", "WH_PT_3", "L1_OUT", "L2_OUT", "L3_OUT",
                "E1_IN", "E2_IN", "CHARGER_HUGE_1", "CHARGER_HUGE_2", "CHARGER_HUGE_3"]
    missing = [r for r in required if r not in G]
    if missing:
        raise SystemExit("FALTAN nodos requeridos por el core NestLink: %s" % missing)

    return layout, G, pos


def write_seed_huge():
    seed = {
        "lines": [
            {"id": "L1_OUT", "nombre": "Línea Papas Fritas", "material": "Papa deshidratada",
             "tasa_consumo_kg_min": 4.5, "umbral_critico_pct": 25, "nivel_inicial_pct": 70,
             "capacidad_pallet_unidades": 480},
            {"id": "L2_OUT", "nombre": "Línea Galletas", "material": "Harina de trigo",
             "tasa_consumo_kg_min": 3.8, "umbral_critico_pct": 25, "nivel_inicial_pct": 65,
             "capacidad_pallet_unidades": 480},
            {"id": "L3_OUT", "nombre": "Línea Snacks Extruidos", "material": "Maíz extruido",
             "tasa_consumo_kg_min": 5.0, "umbral_critico_pct": 25, "nivel_inicial_pct": 60,
             "capacidad_pallet_unidades": 600},
        ],
        "skus": [
            {"id": "SKU_PAP_01", "nombre": "Papas Fritas 150g", "categoria": "Producto Terminado",
             "material_empaque": "Bolsa metalizada", "packaging": "Caja x24", "peso_unitario_kg": 3.6},
            {"id": "SKU_GAL_01", "nombre": "Galletas 200g", "categoria": "Producto Terminado",
             "material_empaque": "Film flowpack", "packaging": "Caja x20", "peso_unitario_kg": 4.0},
            {"id": "SKU_SNK_01", "nombre": "Snack Extruido 100g", "categoria": "Producto Terminado",
             "material_empaque": "Bolsa HDPE", "packaging": "Caja x30", "peso_unitario_kg": 3.0},
            {"id": "SKU_EMP_01", "nombre": "Film empaque", "categoria": "Insumo",
             "material_empaque": "Film", "packaging": "Bobina", "peso_unitario_kg": 18.0},
        ],
        "amrs": [
            {"id": "AMR_01", "nombre": "Huge Shuttle 1", "tipo": "pallet_lifter", "velocidad_ms": 1.5,
             "carga_kg": 500, "bateria_inicial": 95, "posicion_nodo": "CHARGER_HUGE_1", "home_zone": "corr_0.00"},
            {"id": "AMR_02", "nombre": "Huge Shuttle 2", "tipo": "pallet_lifter", "velocidad_ms": 1.5,
             "carga_kg": 500, "bateria_inicial": 88, "posicion_nodo": "CHARGER_HUGE_2", "home_zone": "east_0.00"},
            {"id": "AMR_03", "nombre": "Huge Tugger 1", "tipo": "towing_tug", "velocidad_ms": 0.9,
             "carga_kg": 400, "bateria_inicial": 80, "posicion_nodo": "CHARGER_HUGE_3", "home_zone": "corr_47.10"},
            {"id": "AMR_04", "nombre": "Huge Unit 1", "tipo": "unit_load", "velocidad_ms": 1.5,
             "carga_kg": 300, "bateria_inicial": 90, "posicion_nodo": "corr_12.00", "home_zone": "corr_12.00"},
            {"id": "AMR_05", "nombre": "Huge Shuttle 3", "tipo": "pallet_lifter", "velocidad_ms": 1.5,
             "carga_kg": 500, "bateria_inicial": 75, "posicion_nodo": "fin_linea1", "home_zone": "corr_12.00"},
            {"id": "AMR_06", "nombre": "Huge Unit 2", "tipo": "unit_load", "velocidad_ms": 1.5,
             "carga_kg": 300, "bateria_inicial": 85, "posicion_nodo": "buf_linea2_0", "home_zone": "corr_28.00"},
        ],
    }
    return seed


def main():
    layout, G, pos = build()
    os.makedirs(MAPS_DIR, exist_ok=True)
    os.makedirs(SEEDS_DIR, exist_ok=True)

    n_uni = sum(1 for e in layout["edges"] if e["direction"] == "uni")
    with open(os.path.join(MAPS_DIR, "huge.json"), "w", encoding="utf-8") as f:
        json.dump(layout, f, ensure_ascii=False, indent=2)

    seed = write_seed_huge()
    # re-validar posicion_nodo del seed contra el grafo final
    amr_starts = [a["posicion_nodo"] for a in seed["amrs"]]
    missing = [s for s in amr_starts if s not in G]
    if missing:
        raise SystemExit("posicion_nodo inválido en seed: %s" % missing)
    with open(os.path.join(SEEDS_DIR, "seed_huge.json"), "w", encoding="utf-8") as f:
        json.dump(seed, f, ensure_ascii=False, indent=2)

    print("[convert_huge] OK")
    print("  nodos:", G.number_of_nodes(), "| aristas dirigidas:", G.number_of_edges(), "| uni:", n_uni)
    print("  zonas:", len(layout["zones"]), "| lines:", len(layout["lines"]), "| peds:", len(layout["pedestrians"]))
    print("  weak_components:", nx.number_weakly_connected_components(G))
    print("  amr starts:", amr_starts)


if __name__ == "__main__":
    main()
