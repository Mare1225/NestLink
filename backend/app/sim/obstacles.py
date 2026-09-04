# app/sim/obstacles.py
# Simulación de operarios peatonales (zonas de seguridad) y bloqueos dinámicos

import math
from typing import List,Dict,Tuple,Optional,Any
from app.models import ObstaculoState

class PedestrianAgent:
    def __init__(self, id_str: str, name: str, waypoints: List[str], speed: float = 1.0, radius: float = 2.5, node_positions: Dict[str, Tuple[float, float]] = None):
        self.id = id_str
        self.name = name
        self.waypoints = waypoints
        self.speed = speed # m/s
        self.radius = radius # metros de seguridad
        self.node_positions = node_positions or {}
        
        self.current_wp_idx = 0
        if waypoints and waypoints[0] in self.node_positions:
            self.x, self.y = self.node_positions[waypoints[0]]
        else:
            self.x, self.y = (400.0, 220.0)

    def step(self, dt: float):
        if not self.waypoints or len(self.waypoints) < 2:
            return

        target_node = self.waypoints[self.current_wp_idx]
        tx, ty = self.node_positions.get(target_node, (self.x, self.y))

        dx = tx - self.x
        dy = ty - self.y
        dist = math.sqrt(dx * dx + dy * dy)

        step_dist = self.speed * 10.0 * dt # 10 px = 1m

        if dist <= step_dist:
            self.x = tx
            self.y = ty
            self.current_wp_idx = (self.current_wp_idx + 1) % len(self.waypoints)
        else:
            self.x += (dx / dist) * step_dist
            self.y += (dy / dist) * step_dist

class ObstacleManager:
    def __init__(self, layout_data: Dict[str, Any], node_positions: Dict[str, Tuple[float, float]]):
        self.node_positions = node_positions
        self.pedestrians: List[PedestrianAgent] = []
        self.blocked_edges: Dict[Tuple[str, str], str] = {} # {(u, v): tipo_obstaculo}

        for ped in layout_data.get("pedestrians", []):
            self.pedestrians.append(
                PedestrianAgent(
                    id_str=ped["id"],
                    name=ped.get("name", ped["id"]),
                    waypoints=ped.get("waypoints", []),
                    speed=float(ped.get("speed", 1.0)),
                    radius=float(ped.get("radius", 2.5)),
                    node_positions=node_positions
                )
            )

    def step(self, dt: float):
        for ped in self.pedestrians:
            ped.step(dt)

    def add_block(self, u: str, v: str, tipo: str = "SPILL"):
        self.blocked_edges[(u, v)] = tipo
        self.blocked_edges[(v, u)] = tipo

    def remove_block(self, u: str, v: str):
        self.blocked_edges.pop((u, v), None)
        self.blocked_edges.pop((v, u), None)

    def get_snapshot(self) -> List[ObstaculoState]:
        obs_list = []
        # Peatones
        for ped in self.pedestrians:
            obs_list.append(
                ObstaculoState(
                    id=ped.id,
                    tipo="OPERATOR",
                    x=round(ped.x, 1),
                    y=round(ped.y, 1),
                    radius=ped.radius,
                    edge=None
                )
            )
        # Bloqueos de aristas
        seen = set()
        for (u, v), tipo in self.blocked_edges.items():
            pair = tuple(sorted([u, v]))
            if pair in seen:
                continue
            seen.add(pair)
            pu = self.node_positions.get(u, (0.0, 0.0))
            pv = self.node_positions.get(v, (0.0, 0.0))
            mid_x = (pu[0] + pv[0]) / 2.0
            mid_y = (pu[1] + pv[1]) / 2.0
            obs_list.append(
                ObstaculoState(
                    id=f"BLK_{u}_{v}",
                    tipo=tipo,
                    x=round(mid_x, 1),
                    y=round(mid_y, 1),
                    radius=0.0,
                    edge=[u, v]
                )
            )
        return obs_list
