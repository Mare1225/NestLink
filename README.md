# Nestlé Planta Simulación

Simulación interactiva de intralogística para una planta Nestlé, construida con **Flask** + **JavaScript vanilla**.

## Características

- **Planta completa**: 120 × 80 m con 3 líneas de producción, zona de almacén y zona de despacho
- **Grafo de navegación**: 504 nodos y 527 aristas con rutas alternativas y corredores de bypass
- **Bloqueo de aristas (Edge Locking)**: cada segmento del grafo solo puede ser ocupado por un vehículo a la vez
- **Pathfinding A\***: cálculo de rutas óptimas con recálculo automático ante bloqueos
- **Sensores de proximidad**: detección de colisión basada en distancia con prioridad por tipo de vehículo
- **5 vehículos**: 3 AMR Forklifts (1.5 m/s) y 2 Tuggers (0.9 m/s)
- **API REST**: endpoints para consultar grafo, planta, vehículos y calcular rutas
- **Visualización**: canvas HTML5 con zoom, temas claro/oscuro y estadísticas en tiempo real

## Instalación

```bash
# Clonar repositorio
git clone <url-del-repo>
cd nestle-sim-flask

# Crear entorno virtual
python3 -m venv .venv
source .venv/bin/activate   # Linux/macOS
# .venv\Scripts\activate    # Windows

# Instalar dependencias
pip install -r requirements.txt
```

## Ejecución

```bash
python app.py
```

Abrir [http://localhost:5000](http://localhost:5000) en el navegador.

## Estructura del proyecto

```
nestle-sim-flask/
├── app.py                    # Servidor Flask — punto de entrada
├── config.py                 # Configuración de planta, vehículos, sensores
├── requirements.txt          # Dependencias Python
├── models/
│   ├── __init__.py
│   ├── grafo.py              # Grafo de navegación, A*, estadísticas
│   ├── planta.py             # Layout de la planta y zonas
│   └── vehiculos.py          # Tipos de vehículos y flota
├── static/
│   ├── css/
│   │   └── style.css         # Estilos de la interfaz
│   └── js/
│       ├── data.js           # Datos del grafo (504 nodos, 527 aristas)
│       ├── pathfinding.js    # Algoritmo A* (cliente)
│       ├── vehiculos.js      # Lógica de vehículos, edge locking, sensores
│       ├── render.js         # Renderizado del canvas
│       └── main.js           # UI, controles y loop de animación
└── templates/
    └── index.html            # Template principal (Jinja2)
```

## API REST

| Endpoint | Descripción |
|----------|-------------|
| `GET /` | Página principal con la simulación |
| `GET /api/grafo` | Datos completos del grafo (nodos, aristas, pesos) |
| `GET /api/grafo/stats` | Estadísticas del grafo |
| `GET /api/planta` | Layout de la planta (zonas, dimensiones) |
| `GET /api/vehiculos` | Configuración de vehículos y flota |
| `GET /api/ruta/<inicio>/<destino>` | Calcula ruta A* entre dos nodos |
| `GET /api/info` | Información general de la simulación |

## Controles de la simulación

| Control | Acción |
|---------|--------|
| Pausa | Pausa/reanuda la simulación |
| Grafo | Muestra/oculta el grafo de navegación |
| Velocidad (slider) | Ajusta de 1× a 20× |

## Tecnologías

- **Backend**: Python 3, Flask
- **Frontend**: HTML5 Canvas, JavaScript vanilla, CSS custom properties
- **Tipografía**: Inter + JetBrains Mono (Google Fonts)
- **Algoritmos**: A* pathfinding, edge locking, sensores de proximidad

## Licencia

Proyecto académico — USFQ.
