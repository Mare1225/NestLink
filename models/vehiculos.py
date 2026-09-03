"""
Modelo de vehículos y flota.
Define tipos de vehículos, configuración de la flota y
parámetros de sensores de proximidad.
"""
from config import VEHICULOS, FLOTA, SENSOR


def obtener_tipos_vehiculo():
    """
    Retorna la configuración de tipos de vehículos
    en el formato esperado por el frontend.
    """
    tipos = {}
    for tipo, cfg in VEHICULOS.items():
        tipos[tipo] = {
            "v": cfg["velocidad"],
            "c": cfg["color"],
            "l": cfg["label"],
        }
    return tipos


def obtener_flota():
    """
    Retorna la configuración de flota en el formato
    esperado por el frontend.
    """
    return [
        {"tipo": f["tipo"], "cantidad": f["cantidad"]}
        for f in FLOTA
    ]


def obtener_config_sensor():
    """Retorna la configuración del sensor de proximidad."""
    return {
        "radioDeteccion": SENSOR["radio_deteccion"],
        "radioFrenado": SENSOR["radio_frenado"],
        "tChequeo": SENSOR["t_chequeo"],
        "maxEspera": SENSOR["max_espera"],
    }


def resumen_flota():
    """Retorna un resumen legible de la flota."""
    total = sum(f["cantidad"] for f in FLOTA)
    detalle = []
    for f in FLOTA:
        cfg = VEHICULOS[f["tipo"]]
        detalle.append({
            "tipo": f["tipo"],
            "cantidad": f["cantidad"],
            "velocidad": cfg["velocidad"],
            "label": cfg["label"],
        })
    return {
        "total_vehiculos": total,
        "detalle": detalle,
    }
