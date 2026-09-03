"""
Modelo de la planta: zonas, almacenes y ubicaciones.
Define la geometría completa de la planta Nestlé.
"""
from config import PLANTA_ANCHO, PLANTA_ALTO, CORREDOR, LINEAS


def generar_zonas():
    """
    Genera la lista de zonas de la planta.
    Cada zona: [label, x, y, ancho, alto, color]
    """
    zonas = []

    # Corredor principal
    zonas.append([
        "Corredor Principal",
        CORREDOR["x"], 0,
        CORREDOR["w"], PLANTA_ALTO,
        "none"
    ])

    # Zonas de producción (una por línea)
    for linea in LINEAS:
        zonas.append([
            linea["nombre"],
            linea["x"], linea["yb"],
            CORREDOR["x"] - linea["x"] - 2,
            linea["yt"] - linea["yb"],
            linea["color_zona"],
        ])

    # Zona de almacén (lado derecho)
    almacen_x = CORREDOR["x"] + CORREDOR["w"] + 2
    almacen_w = PLANTA_ANCHO - almacen_x - 2
    zonas.append([
        "Almacén MP",
        almacen_x, 2,
        almacen_w / 2, PLANTA_ALTO / 2 - 4,
        "#fef9c3",
    ])
    zonas.append([
        "Almacén PT",
        almacen_x + almacen_w / 2 + 2, 2,
        almacen_w / 2 - 2, PLANTA_ALTO / 2 - 4,
        "#dbeafe",
    ])

    # Zona de despacho
    zonas.append([
        "Despacho",
        almacen_x, PLANTA_ALTO / 2 + 2,
        almacen_w, PLANTA_ALTO / 2 - 4,
        "#dcfce7",
    ])

    return zonas


def obtener_layout():
    """Retorna el layout completo de la planta como diccionario."""
    return {
        "ancho": PLANTA_ANCHO,
        "alto": PLANTA_ALTO,
        "corredor": CORREDOR,
        "lineas": LINEAS,
        "zonas": generar_zonas(),
    }
