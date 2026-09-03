"""
Modelo del grafo de navegación.
Contiene la lógica de construcción del grafo y el algoritmo A*
ejecutado en el servidor para validación y pre-cálculo de rutas.

NOTA: El grafo principal con los 504 nodos y 527 aristas se genera
desde el proyecto Python de generación (generador.py) y se sirve
como JSON estático. Este módulo provee utilidades de grafo para
el backend.
"""
import heapq
import math
import json
import os


def cargar_grafo_desde_data():
    """
    Carga el grafo desde el archivo data.js (extrae el JSON del const D).
    Retorna dict con claves N (nodos), E (aristas), W, H, Z, C, L, V, F.
    """
    data_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        'static', 'js', 'data.js'
    )
    with open(data_path, 'r') as f:
        content = f.read()

    # Extraer el objeto JSON del const D = {...};
    start = content.index('{')
    # Encontrar el último ;
    end = content.rindex(';')
    json_str = content[start:end]
    return json.loads(json_str)


def construir_adyacencia(grafo_data):
    """
    Construye el diccionario de adyacencia a partir de los datos del grafo.
    Retorna: dict[str, list[tuple[str, float]]]
    """
    adj = {n: [] for n in grafo_data['N']}
    for u, v, w in grafo_data['E']:
        adj[u].append((v, w))
        adj[v].append((u, w))
    return adj


def heuristica(nodos, a, b):
    """Heurística euclidiana para A*."""
    ax, ay = nodos[a]
    bx, by = nodos[b]
    return math.hypot(bx - ax, by - ay)


def astar(nodos, adj, inicio, destino):
    """
    Algoritmo A* para encontrar la ruta más corta entre dos nodos.

    Args:
        nodos: dict[str, [float, float]] - posiciones de nodos
        adj: dict[str, list[tuple[str, float]]] - grafo de adyacencia
        inicio: str - nodo de inicio
        destino: str - nodo destino

    Returns:
        list[str] | None - ruta como lista de nodos, o None si no hay ruta
    """
    if inicio == destino:
        return [inicio]

    g_score = {inicio: 0}
    f_score = {inicio: heuristica(nodos, inicio, destino)}
    prev = {}
    open_set = [(f_score[inicio], inicio)]
    closed = set()

    while open_set:
        _, current = heapq.heappop(open_set)

        if current == destino:
            path = []
            c = destino
            while c is not None:
                path.append(c)
                c = prev.get(c)
            return list(reversed(path))

        if current in closed:
            continue
        closed.add(current)

        for vecino, peso in adj.get(current, []):
            if vecino in closed:
                continue
            tentative_g = g_score[current] + peso
            if tentative_g < g_score.get(vecino, float('inf')):
                g_score[vecino] = tentative_g
                f = tentative_g + heuristica(nodos, vecino, destino)
                f_score[vecino] = f
                prev[vecino] = current
                heapq.heappush(open_set, (f, vecino))

    return None  # No hay ruta


def estadisticas_grafo(grafo_data):
    """Retorna estadísticas del grafo."""
    n_nodos = len(grafo_data['N'])
    n_aristas = len(grafo_data['E'])
    pesos = [e[2] for e in grafo_data['E']]
    return {
        "nodos": n_nodos,
        "aristas": n_aristas,
        "peso_min": round(min(pesos), 4) if pesos else 0,
        "peso_max": round(max(pesos), 4) if pesos else 0,
        "peso_promedio": round(sum(pesos) / len(pesos), 4) if pesos else 0,
    }
