"""
Servidor de Laboratorio Interactivo de Árboles Binarios (BST / ABB)
Usa únicamente la librería estándar de Python (http.server + json) para no requerir instalaciones externas.
"""
import json
import os
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse
from arbol_bst import ArbolBinarioBusqueda

DIRECTORIO_BASE = os.path.dirname(os.path.abspath(__file__))
DIRECTORIO_STATIC = os.path.join(DIRECTORIO_BASE, "static")

arbol = ArbolBinarioBusqueda()


def cargar_arbol_ejemplo():
    """Carga el árbol clásico que estudiamos en la clase: 10, 5, 15, 3, 7, 20, 6"""
    global arbol
    arbol = ArbolBinarioBusqueda()
    for v in [10, 5, 15, 3, 7, 20, 6]:
        arbol.insertar_con_pasos(v)


# Iniciamos con el árbol de la clase cargado por defecto
cargar_arbol_ejemplo()


class ManejadorLaboratorio(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORIO_STATIC, **kwargs)

    def _enviar_json(self, datos, codigo=200):
        cuerpo = json.dumps(datos, ensure_ascii=False).encode("utf-8")
        self.send_response(codigo)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(cuerpo)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(cuerpo)

    def do_GET(self):
        ruta = urlparse(self.path).path

        if ruta == "/api/estado":
            self._enviar_json(arbol.estado_completo())
        elif ruta == "/api/recorrer/preorden":
            datos = arbol.recorrido_pre_orden()
            datos.update(arbol.estado_completo())
            self._enviar_json(datos)
        elif ruta == "/api/recorrer/inorden":
            datos = arbol.recorrido_in_orden()
            datos.update(arbol.estado_completo())
            self._enviar_json(datos)
        elif ruta == "/api/recorrer/postorden":
            datos = arbol.recorrido_post_orden()
            datos.update(arbol.estado_completo())
            self._enviar_json(datos)
        elif ruta == "/api/recorrer/niveles":
            datos = arbol.recorrido_por_niveles()
            datos.update(arbol.estado_completo())
            self._enviar_json(datos)
        elif ruta == "/api/minimo":
            datos = arbol.buscar_minimo_con_pasos()
            datos.update(arbol.estado_completo())
            self._enviar_json(datos)
        else:
            super().do_GET()

    def do_POST(self):
        global arbol
        ruta = urlparse(self.path).path
        longitud = int(self.headers.get("Content-Length", 0))
        cuerpo_raw = self.rfile.read(longitud).decode("utf-8") if longitud > 0 else "{}"
        try:
            payload = json.loads(cuerpo_raw)
        except json.JSONDecodeError:
            payload = {}

        if ruta == "/api/insertar":
            valor = int(payload.get("valor", 0))
            resultado = arbol.insertar_con_pasos(valor)
            resultado.update(arbol.estado_completo())
            self._enviar_json(resultado)
        elif ruta == "/api/reiniciar":
            arbol = ArbolBinarioBusqueda()
            self._enviar_json(arbol.estado_completo())
        elif ruta == "/api/ejemplo":
            cargar_arbol_ejemplo()
            self._enviar_json(arbol.estado_completo())
        else:
            self._enviar_json({"error": "Ruta no encontrada"}, 404)

    def log_message(self, format, *args):
        # Silenciar logs innecesarios en consola
        pass


if __name__ == "__main__":
    puerto = 8080
    servidor = HTTPServer(("127.0.0.1", puerto), ManejadorLaboratorio)
    print(f"[OK] Laboratorio de Arboles Binarios activo en: http://127.0.0.1:{puerto}", flush=True)
    servidor.serve_forever()
