# app/data_maps.py
# Carga y gestión del grafo canónico de la planta con NetworkX y multi-planta

import json
import os
import networkx as nx
from typing import Dict, Any, Tuple

MAPS_DIR = os.path.join(os.path.dirname(__file__), "data", "maps")
SEEDS_DIR = os.path.join(os.path.dirname(__file__), "data", "seeds")

PLANT_CONFIGS = {
    "quito": {
        "id": "quito",
        "nombre": "Planta Quito",
        "map_file": "plant_layout.json",
        "seed_file": "seed.json"
    },
    "huge": {"id":"huge","nombre":"Planta Huge","map_file":"huge.json","seed_file":"seed_huge.json"},
    "cd_guayaquil": {
        "id": "cd_guayaquil",
        "nombre": "CD Guayaquil",
        "map_file": "cd_guayaquil.json",
        "seed_file": "seed_guayaquil.json"
    }
}

def load_layout_raw(plant_id: str = "quito") -> Dict[str, Any]:
    cfg = PLANT_CONFIGS.get(plant_id, PLANT_CONFIGS["quito"])
    file_path = os.path.join(MAPS_DIR, cfg["map_file"])
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_seeds_raw(plant_id: str = "quito") -> Dict[str, Any]:
    cfg = PLANT_CONFIGS.get(plant_id, PLANT_CONFIGS["quito"])
    file_path = os.path.join(SEEDS_DIR, cfg["seed_file"])
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)

def build_plant_graph(layout_data: Dict[str, Any]) -> Tuple[nx.DiGraph, Dict[str, Tuple[float, float]]]:
    G = nx.DiGraph()
    node_positions = {}

    for node in layout_data.get("nodes", []):
        nid = node["id"]
        pos = (float(node["x"]), float(node["y"]))
        node_positions[nid] = pos
        G.add_node(
            nid,
            x=pos[0],
            y=pos[1],
            type=node.get("type", "cruce"),
            label=node.get("label", nid)
        )

    for edge in layout_data.get("edges", []):
        u = edge["from"]
        v = edge["to"]
        length = float(edge.get("length", 10.0))
        max_speed = float(edge.get("max_speed", 1.5))
        direction = edge.get("direction", "bi")
        blocked = bool(edge.get("blocked", False))
        weight = length / max(max_speed, 0.1)

        G.add_edge(u, v, length=length, max_speed=max_speed, weight=weight, blocked=blocked, direction=direction)
        if direction == "bi":
            G.add_edge(v, u, length=length, max_speed=max_speed, weight=weight, blocked=blocked, direction=direction)

    return G, node_positions
