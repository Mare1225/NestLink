import unittest
import random
from app.sim.env import SimulationEnvironment
from app.sim.routing import find_shortest_path
from app.sim.generators import resolve_pt_destination
from app.models import Tarea


class TestRound13PackageBusinessFlow(unittest.TestCase):
    """Ronda 13: Flujo de negocio completo del paquete MP → Línea → Paletizado → OUT → fin."""

    def setUp(self):
        random.seed(42)
        self.env = SimulationEnvironment("realistic")
        self.env.obstacle_manager.pedestrians = []
        self.env.mission_queue.missions = []
        self.env.notices = []
        for amr in self.env.amrs:
            amr.tarea_actual = None
            amr.path = []
            amr.estado = "IDLE"
            amr.idle_timer = 0.0
            amr.cediendo_paso = False
            amr._estado_desde = self.env.sim_time

    def test_01_mp_supply_llega_a_linea(self):
        """1) SUPPLY_REQUEST completado → el insumo queda en la línea (restock +20% aplicado)."""
        line = next(l for l in self.env.generator.lines if l.id == "E1_IN")
        line.nivel_pct = 15.0

        amr = self.env.amrs[0]
        amr.posicion_nodo = "E1_IN"
        amr.x, amr.y = self.env.node_positions["E1_IN"]
        amr.estado = "UNLOADING"
        amr.loading_timer = 0.05
        amr.tarea_actual = Tarea(
            id="TSK_SUPPLY_E1",
            tipo="SUPPLY_REQUEST",
            origen="WH_MP_1",
            destino="E1_IN",
            prioridad=10,
            estado="en_curso",
            created_at_sim=0.0,
        )

        amr.step(
            dt_sim=0.1,
            G=self.env.G,
            obstacles=[],
            metrics_manager=self.env.metrics,
            generator_manager=self.env.generator,
            sim_time=50.0,
            env=self.env,
        )

        self.assertAlmostEqual(line.nivel_pct, 35.0, places=6)  # 15 + 20
        self.assertIsNone(amr.tarea_actual)
        self.assertEqual(amr.estado, "IDLE")

    def test_02_linea_genera_pickup_pt(self):
        """2) Tras ~20 s de proceso, la línea encadena PICKUP_PT Línea → WH_PT de la marca."""
        line = next(l for l in self.env.generator.lines if l.id == "L1_OUT")
        line.nivel_pct = 50.0
        line.processing_secs = 0.0

        # Antes de cumplirse los 20 s aún no debe existir PICKUP_PT
        for _ in range(199):
            self.env.generator.step(
                dt_sim=0.1,
                mission_queue=self.env.mission_queue,
                sim_time=self.env.sim_time,
                metrics_manager=self.env.metrics,
            )
        before = [
            m for m in self.env.mission_queue.get_all_missions()
            if m.tipo == "PICKUP_PT" and m.origen == "L1_OUT"
        ]
        self.assertEqual(before, [])

        # Al completar los 20 s se encadena PICKUP_PT
        self.env.generator.step(
            dt_sim=0.1,
            mission_queue=self.env.mission_queue,
            sim_time=self.env.sim_time,
            metrics_manager=self.env.metrics,
        )
        after = [
            m for m in self.env.mission_queue.get_all_missions()
            if m.tipo == "PICKUP_PT" and m.origen == "L1_OUT"
        ]
        self.assertEqual(len(after), 1)
        self.assertEqual(after[0].destino, resolve_pt_destination("L1_OUT", line.nombre))
        self.assertEqual(after[0].destino, "WH_PT_1")  # Nescafé → Paletizado 1
        self.assertEqual(after[0].estado, "pendiente")

    def test_03_paletizado_entrega_a_out_y_fin(self):
        """3) PICKUP_PT entregado en WH_PT encadena EXPEDITION→OUT; completar en OUT termina sin encadenar más."""
        # (a) Entrega de PICKUP_PT en WH_PT_1 encadena EXPEDITION WH_PT_1 → OUT
        amr = self.env.amrs[0]
        amr.posicion_nodo = "WH_PT_1"
        amr.x, amr.y = self.env.node_positions["WH_PT_1"]
        amr.estado = "UNLOADING"
        amr.loading_timer = 0.05
        amr.tarea_actual = Tarea(
            id="TSK_PT_1",
            tipo="PICKUP_PT",
            origen="L1_OUT",
            destino="WH_PT_1",
            prioridad=7,
            estado="en_curso",
            created_at_sim=0.0,
        )
        amr.step(
            dt_sim=0.1,
            G=self.env.G,
            obstacles=[],
            metrics_manager=self.env.metrics,
            generator_manager=self.env.generator,
            sim_time=50.0,
            env=self.env,
        )

        expeditions = [m for m in self.env.mission_queue.get_all_missions() if m.tipo == "EXPEDITION"]
        self.assertEqual(len(expeditions), 1)
        self.assertEqual(expeditions[0].origen, "WH_PT_1")
        self.assertEqual(expeditions[0].destino, "OUT")
        self.assertIsNone(amr.tarea_actual)

        # (b) La EXPEDITION se completa entregando en OUT y el recorrido termina (sin encadenar nada)
        exp = expeditions[0]
        amr2 = self.env.amrs[1]
        amr2.posicion_nodo = "WH_PT_1"
        amr2.x, amr2.y = self.env.node_positions["WH_PT_1"]
        amr2.estado = "UNLOADING"
        amr2.loading_timer = 0.05
        amr2.tarea_actual = exp
        amr2.step(
            dt_sim=0.1,
            G=self.env.G,
            obstacles=[],
            metrics_manager=self.env.metrics,
            generator_manager=self.env.generator,
            sim_time=80.0,
            env=self.env,
        )

        self.assertEqual(exp.estado, "completada")
        self.assertIsNone(amr2.tarea_actual)
        self.assertEqual(amr2.estado, "IDLE")
        # No se encadena ninguna misión nueva para ese paquete (la expedición a OUT no genera nada)
        remaining = self.env.mission_queue.get_all_missions()
        self.assertFalse(any(m.tipo == "EXPEDITION" and m.origen == "OUT" for m in remaining))
        self.assertEqual(len([m for m in remaining if m.tipo == "EXPEDITION"]), 1)

    def test_04_realistic_out_alcanzable(self):
        """4) El nodo OUT existe en realistic y es alcanzable por A* desde WH_PT_*."""
        self.assertIn("OUT", self.env.node_positions)
        self.assertEqual(self.env.node_types["OUT"], "almacen")

        for wh in ["WH_PT_1", "WH_PT_2", "WH_PT_3"]:
            path = find_shortest_path(self.env.G, wh, "OUT", self.env.node_positions)
            self.assertIsNotNone(path, f"No hay ruta A* de {wh} a OUT")
            self.assertEqual(path[0], wh)
            self.assertEqual(path[-1], "OUT")

        # OUT tiene a X_M02 como único vecino en el grafo
        self.assertEqual(list(self.env.G.successors("OUT")), ["X_M02"])


if __name__ == "__main__":
    unittest.main()
