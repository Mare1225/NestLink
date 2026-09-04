import unittest
import random
from app.sim.env import SimulationEnvironment
from app.sim.routing import find_shortest_path
from app.sim.generators import resolve_pt_destination
from app.models import Tarea


class TestRound13PackageBusinessFlow(unittest.TestCase):
    """Ronda 13-15: Flujo de negocio MP → Línea → Paletizado → OUT(buffer, emoji 📦) → muro externo
    vía AMR exclusivo (ruta rosada)."""

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

    def test_03_paletizado_entrega_a_out_y_encadena_export(self):
        """3) PICKUP_PT entregado en WH_PT encadena EXPEDITION→OUT (mejor buffer);
        completar en OUT deja el paquete en buffer (emoji) y encadena EXPORT→MURO_ENTREGA."""
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
        # Todos los OUT vacíos → pick_best_out desempata por id → "OUT"
        self.assertEqual(expeditions[0].destino, "OUT")
        self.assertIsNone(amr.tarea_actual)

        # (b) La EXPEDITION se completa entregando en OUT → paquete queda en buffer (emoji) y se encadena EXPORT
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
        # Ronda 15: completar en OUT deja el paquete en buffer (emoji 📦) y encadena EXPORT → muro externo
        remaining = self.env.mission_queue.get_all_missions()
        self.assertFalse(any(m.tipo == "EXPEDITION" and m.origen == "OUT" for m in remaining))
        self.assertEqual(len([m for m in remaining if m.tipo == "EXPEDITION"]), 1)
        self.assertEqual(self.env.out_stock.get("OUT", 0), 1)
        exports = [m for m in remaining if m.tipo == "EXPORT"]
        self.assertEqual(len(exports), 1)
        self.assertEqual(exports[0].origen, "OUT")
        self.assertEqual(exports[0].destino, "MURO_ENTREGA")

    def test_04_realistic_out_y_corredor_rosado_alcanzables(self):
        """4) OUT y el corredor rosado (ruta exclusiva hasta la pared externa) son alcanzables."""
        self.assertIn("OUT", self.env.node_positions)
        self.assertEqual(self.env.node_types["OUT"], "almacen")
        # Ronda 15: 4 OUTs totales + nodo de entrega en la pared externa
        self.assertEqual(len(self.env.out_nodes), 4)
        self.assertIn("MURO_ENTREGA", self.env.node_positions)
        self.assertEqual(self.env.node_types["MURO_ENTREGA"], "almacen")

        for wh in ["WH_PT_1", "WH_PT_2", "WH_PT_3"]:
            path = find_shortest_path(self.env.G, wh, "OUT", self.env.node_positions)
            self.assertIsNotNone(path, f"No hay ruta A* de {wh} a OUT")
            self.assertEqual(path[0], wh)
            self.assertEqual(path[-1], "OUT")

        # OUT se conecta por su vertical al anillo superior (X_T11) y al corredor rosado (OUT_2 → muro)
        self.assertIn("X_T11", list(self.env.G.successors("OUT")))
        self.assertIn("OUT_2", list(self.env.G.successors("OUT")))
        route = find_shortest_path(self.env.G, "OUT", "MURO_ENTREGA", self.env.node_positions)
        self.assertIsNotNone(route, "No hay ruta A* de OUT a MURO_ENTREGA (ruta rosada)")
        self.assertEqual(route[-1], "MURO_ENTREGA")

    def test_05_entrega_exclusiva_al_muro_y_emoji(self):
        """5) Ronda 15: EXPORT solo lo ejecuta el AMR_06 (entrega exclusiva), solo si hay stock
        en OUT; al recoger del OUT el paquete sale del buffer (el emoji 📦 se apaga)."""
        # (a) AMR designado y buffers iniciales en 0
        self.assertEqual(self.env.delivery_amr_id, "AMR_06")
        self.assertEqual(self.env.out_stock, {"OUT": 0, "OUT_2": 0, "OUT_3": 0, "OUT_4": 0})
        self.assertTrue(all(m.tipo != "EXPORT" for m in self.env.mission_queue.get_all_missions()))

        # (b) Con stock en OUT, el EXPORT se asigna SOLO al AMR_06 (nadie más lo toma)
        self.env.out_stock["OUT"] = 1
        self.env.mission_queue.add_mission(
            tipo="EXPORT", origen="OUT", destino="MURO_ENTREGA", prioridad=7,
            peso_kg=480.0, sim_time=0.0,
        )
        amr6 = next(a for a in self.env.amrs if a.id == "AMR_06")
        amr6.posicion_nodo = "MURO_ENTREGA"
        amr6.x, amr6.y = self.env.node_positions["MURO_ENTREGA"]
        amr6.estado = "IDLE"
        amr6.idle_timer = 1.0
        self.env.step_tick(dt_sim=0.1)
        self.assertEqual(amr6.tarea_actual.tipo, "EXPORT")
        self.assertEqual(amr6.tarea_actual.origen, "OUT")
        self.assertEqual(amr6.tarea_actual.destino, "MURO_ENTREGA")
        for other in [a for a in self.env.amrs if a.id != "AMR_06"]:
            self.assertNotEqual(other.tarea_actual.tipo if other.tarea_actual else None, "EXPORT",
                                "Ningún AMR distinto al exclusivo puede ejecutar EXPORT")

        # (c) Al completar el LOADING en OUT, el paquete sale del buffer → emoji apagado
        amr6.estado = "LOADING"
        amr6.posicion_nodo = "OUT"
        amr6.x, amr6.y = self.env.node_positions["OUT"]
        amr6.loading_timer = 0.05
        amr6.step(
            dt_sim=0.1,
            G=self.env.G,
            obstacles=[],
            metrics_manager=self.env.metrics,
            generator_manager=self.env.generator,
            sim_time=90.0,
            env=self.env,
        )
        self.assertEqual(self.env.out_stock.get("OUT", 0), 0)


if __name__ == "__main__":
    unittest.main()
