"""
Configuración de la planta Nestlé.
Define dimensiones, zonas, líneas de producción y tipos de vehículos.
"""

# ── Dimensiones de la planta ────────────────────────────────
PLANTA_ANCHO = 120   # metros
PLANTA_ALTO = 80     # metros

# ── Corredor principal ──────────────────────────────────────
CORREDOR = {
    "x": 55,    # posición x del corredor
    "w": 10,    # ancho del corredor
}

# ── Líneas de producción ────────────────────────────────────
LINEAS = [
    {
        "nombre": "Papas Fritas",
        "color_zona": "#fee2e2",
        "x": 10,
        "yb": 5,    # y bottom
        "yt": 25,   # y top
    },
    {
        "nombre": "Galletas",
        "color_zona": "#fce7f3",
        "x": 10,
        "yb": 30,
        "yt": 50,
    },
    {
        "nombre": "Snacks Extruidos",
        "color_zona": "#e0f2fe",
        "x": 10,
        "yb": 55,
        "yt": 75,
    },
]

# ── Tipos de vehículos ──────────────────────────────────────
VEHICULOS = {
    "amr_forklift": {
        "velocidad": 1.5,       # m/s
        "color": "#3b6ff5",
        "label": "AMR Forklift",
        "descripcion": "Montacargas autónomo para pallets",
    },
    "tugger": {
        "velocidad": 0.9,       # m/s
        "color": "#9055e8",
        "label": "Tugger",
        "descripcion": "Vehículo de arrastre para trenes logísticos",
    },
}

# ── Flota ───────────────────────────────────────────────────
FLOTA = [
    {"tipo": "amr_forklift", "cantidad": 3},
    {"tipo": "tugger", "cantidad": 2},
]

# ── Sensor de proximidad ────────────────────────────────────
SENSOR = {
    "radio_deteccion": 3.0,   # metros
    "radio_frenado": 1.8,     # metros
    "t_chequeo": 0.3,         # segundos entre chequeos
    "max_espera": 8.0,        # segundos max antes de recalcular ruta
}
