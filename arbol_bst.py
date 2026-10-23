"""
Módulo Educativo: Árbol Binario de Búsqueda (BST / ABB)
Implementación completa con trazas paso a paso para visualización gráfica.
"""
from collections import deque


class Nodo:
    def __init__(self, valor: int):
        self.valor = valor
        self.izquierda = None
        self.derecha = None

    def a_diccionario(self):
        """Convierte el nodo y sus subárboles en un diccionario serializable a JSON."""
        return {
            "valor": self.valor,
            "izquierda": self.izquierda.a_diccionario() if self.izquierda else None,
            "derecha": self.derecha.a_diccionario() if self.derecha else None,
        }


class ArbolBinarioBusqueda:
    def __init__(self):
        self.raiz = None

    # ==========================================
    # 1. INSERCIÓN PASO A PASO (Propiedad BST)
    # ==========================================
    def insertar_con_pasos(self, valor: int):
        """
        Inserta un valor respetando la propiedad BST (menores a la izquierda,
        mayores a la derecha) y devuelve la lista de pasos para animar.
        """
        pasos = []

        if self.raiz is None:
            self.raiz = Nodo(valor)
            pasos.append({
                "nodo": valor,
                "accion": "insertar",
                "mensaje": f"El árbol estaba vacío. Se crea la raíz con el valor {valor}."
            })
            return {"insertado": True, "pasos": pasos}

        actual = self.raiz
        while True:
            if valor == actual.valor:
                pasos.append({
                    "nodo": actual.valor,
                    "accion": "duplicado",
                    "mensaje": f"El valor {valor} ya existe en el nodo {actual.valor}. En un BST estándar no se duplican valores."
                })
                return {"insertado": False, "pasos": pasos}

            elif valor < actual.valor:
                pasos.append({
                    "nodo": actual.valor,
                    "accion": "comparar_izquierda",
                    "mensaje": f"¿{valor} < {actual.valor}? Sí (es MENOR) → Bajamos por el subárbol IZQUIERDO de {actual.valor}."
                })
                if actual.izquierda is None:
                    actual.izquierda = Nodo(valor)
                    pasos.append({
                        "nodo": valor,
                        "padre": actual.valor,
                        "direccion": "izquierda",
                        "accion": "insertar",
                        "mensaje": f"Espacio vacío (None) encontrado a la izquierda de {actual.valor}. ¡Se inserta el nodo {valor}!"
                    })
                    return {"insertado": True, "pasos": pasos}
                actual = actual.izquierda

            else:
                pasos.append({
                    "nodo": actual.valor,
                    "accion": "comparar_derecha",
                    "mensaje": f"¿{valor} > {actual.valor}? Sí (es MAYOR) → Bajamos por el subárbol DERECHO de {actual.valor}."
                })
                if actual.derecha is None:
                    actual.derecha = Nodo(valor)
                    pasos.append({
                        "nodo": valor,
                        "padre": actual.valor,
                        "direccion": "derecha",
                        "accion": "insertar",
                        "mensaje": f"Espacio vacío (None) encontrado a la derecha de {actual.valor}. ¡Se inserta el nodo {valor}!"
                    })
                    return {"insertado": True, "pasos": pasos}
                actual = actual.derecha

    # ==========================================
    # 2. RECORRIDOS PASO A PASO
    # ==========================================
    def recorrido_pre_orden(self):
        """Raíz -> Izquierda -> Derecha"""
        pasos = []
        resultado = []

        def _pre(nodo):
            if nodo is None:
                return
            resultado.append(nodo.valor)
            pasos.append({
                "nodo": nodo.valor,
                "accion": "visitar",
                "acumulado": list(resultado),
                "mensaje": f"[Pre-Orden] 1° Visitamos el nodo actual ({nodo.valor}) antes que a sus hijos."
            })
            if nodo.izquierda:
                pasos.append({
                    "nodo": nodo.valor,
                    "accion": "explorar",
                    "acumulado": list(resultado),
                    "mensaje": f"[Pre-Orden] 2° Bajamos al hijo izquierdo de {nodo.valor} → ({nodo.izquierda.valor})."
                })
                _pre(nodo.izquierda)
            if nodo.derecha:
                pasos.append({
                    "nodo": nodo.valor,
                    "accion": "explorar",
                    "acumulado": list(resultado),
                    "mensaje": f"[Pre-Orden] 3° Bajamos al hijo derecho de {nodo.valor} → ({nodo.derecha.valor})."
                })
                _pre(nodo.derecha)

        _pre(self.raiz)
        return {"resultado": resultado, "pasos": pasos}

    def recorrido_in_orden(self):
        """Izquierda -> Raíz -> Derecha (Ordena de menor a mayor en un BST)"""
        pasos = []
        resultado = []

        def _in(nodo):
            if nodo is None:
                return
            if nodo.izquierda:
                pasos.append({
                    "nodo": nodo.valor,
                    "accion": "explorar",
                    "acumulado": list(resultado),
                    "mensaje": f"[In-Orden] Primero exploramos el subárbol izquierdo de {nodo.valor} → ({nodo.izquierda.valor})."
                })
                _in(nodo.izquierda)

            resultado.append(nodo.valor)
            pasos.append({
                "nodo": nodo.valor,
                "accion": "visitar",
                "acumulado": list(resultado),
                "mensaje": f"[In-Orden] Ya revisamos la izquierda. Visitamos y registramos el nodo {nodo.valor}."
            })

            if nodo.derecha:
                pasos.append({
                    "nodo": nodo.valor,
                    "accion": "explorar",
                    "acumulado": list(resultado),
                    "mensaje": f"[In-Orden] Ahora exploramos el subárbol derecho de {nodo.valor} → ({nodo.derecha.valor})."
                })
                _in(nodo.derecha)

        _in(self.raiz)
        return {"resultado": resultado, "pasos": pasos}

    def recorrido_post_orden(self):
        """Izquierda -> Derecha -> Raíz (La pequeña pirámide)"""
        pasos = []
        resultado = []

        def _post(nodo):
            if nodo is None:
                return
            if nodo.izquierda:
                pasos.append({
                    "nodo": nodo.valor,
                    "accion": "explorar",
                    "acumulado": list(resultado),
                    "mensaje": f"[Post-Orden] Primero bajamos por la izquierda de {nodo.valor} → ({nodo.izquierda.valor})."
                })
                _post(nodo.izquierda)
            if nodo.derecha:
                pasos.append({
                    "nodo": nodo.valor,
                    "accion": "explorar",
                    "acumulado": list(resultado),
                    "mensaje": f"[Post-Orden] Ahora bajamos por la derecha de {nodo.valor} → ({nodo.derecha.valor})."
                })
                _post(nodo.derecha)

            resultado.append(nodo.valor)
            pasos.append({
                "nodo": nodo.valor,
                "accion": "visitar",
                "acumulado": list(resultado),
                "mensaje": f"[Post-Orden] Hijos de {nodo.valor} completados. Visitamos el nodo padre ({nodo.valor})."
            })

        _post(self.raiz)
        return {"resultado": resultado, "pasos": pasos}

    def recorrido_por_niveles(self):
        """Recorrido en Anchura (BFS - Breadth-First Search) nivel por nivel usando una Cola."""
        pasos = []
        resultado = []
        if self.raiz is None:
            return {"resultado": resultado, "pasos": pasos}

        cola = deque([(self.raiz, 1)])
        while cola:
            actual, nivel = cola.popleft()
            resultado.append(actual.valor)
            hijos_encolados = []
            if actual.izquierda:
                cola.append((actual.izquierda, nivel + 1))
                hijos_encolados.append(str(actual.izquierda.valor))
            if actual.derecha:
                cola.append((actual.derecha, nivel + 1))
                hijos_encolados.append(str(actual.derecha.valor))

            extra = (
                f" Se agregan a la cola sus hijos: {', '.join(hijos_encolados)}."
                if hijos_encolados else " Es hoja (sin hijos para encolar)."
            )
            pasos.append({
                "nodo": actual.valor,
                "accion": "visitar",
                "acumulado": list(resultado),
                "mensaje": f"[Por Niveles - Nivel {nivel}] Visitamos el nodo {actual.valor}.{extra}"
            })

        return {"resultado": resultado, "pasos": pasos}

    # ==========================================
    # 3. BÚSQUEDA DEL MÍNIMO PASO A PASO
    # ==========================================
    def buscar_minimo_con_pasos(self):
        """Avanza siempre hacia la izquierda hasta que nodo.izquierda sea None."""
        pasos = []
        if self.raiz is None:
            return {"minimo": None, "pasos": []}

        actual = self.raiz
        camino = [actual.valor]
        while actual.izquierda is not None:
            pasos.append({
                "nodo": actual.valor,
                "accion": "explorar",
                "acumulado": list(camino),
                "mensaje": f"Estamos en {actual.valor}. Como tiene hijo izquierdo ({actual.izquierda.valor}), sabemos que hay valores menores a la izquierda."
            })
            actual = actual.izquierda
            camino.append(actual.valor)

        pasos.append({
            "nodo": actual.valor,
            "accion": "encontrado",
            "acumulado": [actual.valor],
            "mensaje": f"¡Mínimo encontrado! El nodo {actual.valor} tiene izquierda = None (ya no hay ningún valor menor)."
        })
        return {"minimo": actual.valor, "pasos": pasos}

    # ==========================================
    # 4. MÉTRICAS RECURSIVAS (Retos de clase)
    # ==========================================
    def contar_nodos(self, nodo=None, inicio=True) -> int:
        if inicio:
            nodo = self.raiz
        if nodo is None:
            return 0
        return 1 + self.contar_nodos(nodo.izquierda, False) + self.contar_nodos(nodo.derecha, False)

    def altura(self, nodo=None, inicio=True) -> int:
        if inicio:
            nodo = self.raiz
        if nodo is None:
            return 0
        return 1 + max(self.altura(nodo.izquierda, False), self.altura(nodo.derecha, False))

    def sumar_nodos(self, nodo=None, inicio=True) -> int:
        """¡La función de tu reto final corregida con nodo.valor!"""
        if inicio:
            nodo = self.raiz
        if nodo is None:
            return 0
        return nodo.valor + self.sumar_nodos(nodo.izquierda, False) + self.sumar_nodos(nodo.derecha, False)

    def estado_completo(self):
        return {
            "arbol": self.raiz.a_diccionario() if self.raiz else None,
            "metricas": {
                "total_nodos": self.contar_nodos(),
                "altura": self.altura(),
                "suma_nodos": self.sumar_nodos(),
            }
        }
