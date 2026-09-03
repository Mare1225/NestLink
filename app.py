"""
Nestlé Planta Simulación — Servidor Flask
==========================================
Sirve la simulación interactiva de intralogística y expone
una API REST para consultar datos del grafo y la planta.

Uso:
    python app.py
    → http://localhost:5001
"""
from flask import Flask, render_template, jsonify
from models.grafo import (
    cargar_grafo_desde_data,
    construir_adyacencia,
    astar,
    estadisticas_grafo,
)
from models.vehiculos import (
    obtener_tipos_vehiculo,
    obtener_flota,
    obtener_config_sensor,
    resumen_flota,
)
from models.planta import obtener_layout
from config import PLANTA_ANCHO, PLANTA_ALTO

app = Flask(__name__)

# ── Cargar datos del grafo al inicio ────────────────────────
grafo_data = cargar_grafo_desde_data()
adj = construir_adyacencia(grafo_data)


# ── Rutas de página ─────────────────────────────────────────
@app.route('/')
def index():
    """Página principal con la simulación."""
    return render_template('index.html')


# ── API REST ────────────────────────────────────────────────
@app.route('/api/grafo')
def api_grafo():
    """Retorna los datos completos del grafo de navegación."""
    return jsonify(grafo_data)


@app.route('/api/grafo/stats')
def api_grafo_stats():
    """Retorna estadísticas del grafo."""
    return jsonify(estadisticas_grafo(grafo_data))


@app.route('/api/planta')
def api_planta():
    """Retorna el layout de la planta."""
    return jsonify(obtener_layout())


@app.route('/api/vehiculos')
def api_vehiculos():
    """Retorna configuración de vehículos y flota."""
    return jsonify({
        "tipos": obtener_tipos_vehiculo(),
        "flota": obtener_flota(),
        "sensor": obtener_config_sensor(),
        "resumen": resumen_flota(),
    })


@app.route('/api/ruta/<inicio>/<destino>')
def api_ruta(inicio, destino):
    """
    Calcula la ruta más corta entre dos nodos usando A*.

    Ejemplo: /api/ruta/pa_secos_0_in/despacho_2_out
    """
    if inicio not in grafo_data['N']:
        return jsonify({"error": f"Nodo '{inicio}' no existe"}), 404
    if destino not in grafo_data['N']:
        return jsonify({"error": f"Nodo '{destino}' no existe"}), 404

    ruta = astar(grafo_data['N'], adj, inicio, destino)
    if ruta is None:
        return jsonify({"error": "No hay ruta disponible"}), 404

    # Calcular distancia total
    dist_total = 0
    for i in range(len(ruta) - 1):
        a, b = ruta[i], ruta[i + 1]
        ax, ay = grafo_data['N'][a]
        bx, by = grafo_data['N'][b]
        dist_total += ((bx - ax)**2 + (by - ay)**2) ** 0.5

    return jsonify({
        "ruta": ruta,
        "nodos": len(ruta),
        "distancia": round(dist_total, 2),
    })


@app.route('/api/info')
def api_info():
    """Información general de la simulación."""
    stats = estadisticas_grafo(grafo_data)
    flota = resumen_flota()
    return jsonify({
        "planta": {
            "ancho": PLANTA_ANCHO,
            "alto": PLANTA_ALTO,
            "lineas_produccion": 3,
            "ubicaciones": 232,
        },
        "grafo": stats,
        "flota": flota,
    })


# ── Arranque del servidor ───────────────────────────────────
if __name__ == '__main__':
    print("=" * 50)
    print("  Nestlé Planta Simulación")
    print(f"  Grafo: {len(grafo_data['N'])} nodos, {len(grafo_data['E'])} aristas")
    print(f"  Planta: {PLANTA_ANCHO} × {PLANTA_ALTO} m")
    print("=" * 50)
    print("  → http://localhost:5000")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5001)
