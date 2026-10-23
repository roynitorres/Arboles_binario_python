/**
 * Laboratorio Interactivo de Árboles Binarios (BST / ABB)
 * Se comunica con el servidor Python (app.py) y cuenta con motor de respaldo
 * para funcionar también si se abre index.html directamente desde el navegador.
 */

const SNIPPETS_PYTHON = {
    insertar: `def insertar(nodo, valor):
    if nodo is None:
        return Nodo(valor)
    if valor < nodo.valor:
        # Menor -> Subárbol Izquierdo (<)
        nodo.izquierda = insertar(nodo.izquierda, valor)
    elif valor > nodo.valor:
        # Mayor -> Subárbol Derecho (>)
        nodo.derecha = insertar(nodo.derecha, valor)
    return nodo`,

    preorden: `def pre_orden(nodo):
    if nodo is not None:
        print(nodo.valor)          # 1° Raíz (Nodo actual)
        pre_orden(nodo.izquierda)  # 2° Subárbol Izquierdo
        pre_orden(nodo.derecha)    # 3° Subárbol Derecho`,

    inorden: `def in_orden(nodo):
    if nodo is not None:
        in_orden(nodo.izquierda)   # 1° Subárbol Izquierdo
        print(nodo.valor)          # 2° Raíz (Ordena de menor a mayor)
        in_orden(nodo.derecha)     # 3° Subárbol Derecho`,

    postorden: `def post_orden(nodo):
    if nodo is not None:
        post_orden(nodo.izquierda) # 1° Base Izquierda
        post_orden(nodo.derecha)   # 2° Base Derecha
        print(nodo.valor)          # 3° Raíz al final (Pirámide)`,

    niveles: `def por_niveles(raiz):
    cola = deque([raiz])
    while cola:
        actual = cola.popleft()    # Visitamos nivel por nivel
        print(actual.valor)
        if actual.izquierda: cola.append(actual.izquierda)
        if actual.derecha:   cola.append(actual.derecha)`,

    minimo: `def encontrar_minimo(nodo):
    actual = nodo
    # En un ABB, el menor siempre está todo a la izquierda
    while actual.izquierda is not None:
        actual = actual.izquierda
    return actual.valor`
};

// ============================================================================
// MOTOR LOCAL DE RESPALDO (Espejo exacto de arbol_bst.py por si se abre sin servidor)
// ============================================================================
class MotorLocalBST {
    constructor() {
        this.raiz = null;
    }

    insertarConPasos(valor) {
        const pasos = [];
        if (!this.raiz) {
            this.raiz = { valor, izquierda: null, derecha: null };
            pasos.push({
                nodo: valor,
                accion: "insertar",
                mensaje: `El árbol estaba vacío. Se crea la raíz con el valor ${valor}.`
            });
            return { insertado: true, pasos, ...this.estadoCompleto() };
        }

        let actual = this.raiz;
        while (true) {
            if (valor === actual.valor) {
                pasos.push({
                    nodo: actual.valor,
                    accion: "duplicado",
                    mensaje: `El valor ${valor} ya existe en el nodo ${actual.valor}. En un ABB estándar no se duplican valores.`
                });
                return { insertado: false, pasos, ...this.estadoCompleto() };
            } else if (valor < actual.valor) {
                pasos.push({
                    nodo: actual.valor,
                    accion: "comparar_izquierda",
                    mensaje: `¿${valor} < ${actual.valor}? Sí (es MENOR) → Bajamos por la IZQUIERDA de ${actual.valor}.`
                });
                if (!actual.izquierda) {
                    actual.izquierda = { valor, izquierda: null, derecha: null };
                    pasos.push({
                        nodo: valor,
                        padre: actual.valor,
                        accion: "insertar",
                        mensaje: `Espacio vacío (None) a la izquierda de ${actual.valor}. ¡Se inserta el nodo ${valor}!`
                    });
                    return { insertado: true, pasos, ...this.estadoCompleto() };
                }
                actual = actual.izquierda;
            } else {
                pasos.push({
                    nodo: actual.valor,
                    accion: "comparar_derecha",
                    mensaje: `¿${valor} > ${actual.valor}? Sí (es MAYOR) → Bajamos por la DERECHA de ${actual.valor}.`
                });
                if (!actual.derecha) {
                    actual.derecha = { valor, izquierda: null, derecha: null };
                    pasos.push({
                        nodo: valor,
                        padre: actual.valor,
                        accion: "insertar",
                        mensaje: `Espacio vacío (None) a la derecha de ${actual.valor}. ¡Se inserta el nodo ${valor}!`
                    });
                    return { insertado: true, pasos, ...this.estadoCompleto() };
                }
                actual = actual.derecha;
            }
        }
    }

    recorrer(tipo) {
        const pasos = [];
        const resultado = [];

        const pre = (n) => {
            if (!n) return;
            resultado.push(n.valor);
            pasos.push({ nodo: n.valor, accion: "visitar", acumulado: [...resultado], mensaje: `[Pre-Orden] 1° Visitamos el nodo actual (${n.valor}) antes que a sus hijos.` });
            if (n.izquierda) {
                pasos.push({ nodo: n.valor, accion: "explorar", acumulado: [...resultado], mensaje: `[Pre-Orden] 2° Bajamos al hijo izquierdo de ${n.valor} → (${n.izquierda.valor}).` });
                pre(n.izquierda);
            }
            if (n.derecha) {
                pasos.push({ nodo: n.valor, accion: "explorar", acumulado: [...resultado], mensaje: `[Pre-Orden] 3° Bajamos al hijo derecho de ${n.valor} → (${n.derecha.valor}).` });
                pre(n.derecha);
            }
        };

        const ino = (n) => {
            if (!n) return;
            if (n.izquierda) {
                pasos.push({ nodo: n.valor, accion: "explorar", acumulado: [...resultado], mensaje: `[In-Orden] Primero exploramos el subárbol izquierdo de ${n.valor} → (${n.izquierda.valor}).` });
                ino(n.izquierda);
            }
            resultado.push(n.valor);
            pasos.push({ nodo: n.valor, accion: "visitar", acumulado: [...resultado], mensaje: `[In-Orden] Izquierda lista. Visitamos y registramos el nodo ${n.valor}.` });
            if (n.derecha) {
                pasos.push({ nodo: n.valor, accion: "explorar", acumulado: [...resultado], mensaje: `[In-Orden] Ahora exploramos el subárbol derecho de ${n.valor} → (${n.derecha.valor}).` });
                ino(n.derecha);
            }
        };

        const post = (n) => {
            if (!n) return;
            if (n.izquierda) {
                pasos.push({ nodo: n.valor, accion: "explorar", acumulado: [...resultado], mensaje: `[Post-Orden] Primero bajamos por la izquierda de ${n.valor} → (${n.izquierda.valor}).` });
                post(n.izquierda);
            }
            if (n.derecha) {
                pasos.push({ nodo: n.valor, accion: "explorar", acumulado: [...resultado], mensaje: `[Post-Orden] Ahora bajamos por la derecha de ${n.valor} → (${n.derecha.valor}).` });
                post(n.derecha);
            }
            resultado.push(n.valor);
            pasos.push({ nodo: n.valor, accion: "visitar", acumulado: [...resultado], mensaje: `[Post-Orden] Hijos de ${n.valor} completados. Visitamos el padre (${n.valor}).` });
        };

        if (tipo === "preorden") pre(this.raiz);
        else if (tipo === "inorden") ino(this.raiz);
        else if (tipo === "postorden") post(this.raiz);
        else if (tipo === "niveles" && this.raiz) {
            const cola = [{ nodo: this.raiz, nivel: 1 }];
            while (cola.length > 0) {
                const { nodo, nivel } = cola.shift();
                resultado.push(nodo.valor);
                const hijos = [];
                if (nodo.izquierda) { cola.push({ nodo: nodo.izquierda, nivel: nivel + 1 }); hijos.push(nodo.izquierda.valor); }
                if (nodo.derecha) { cola.push({ nodo: nodo.derecha, nivel: nivel + 1 }); hijos.push(nodo.derecha.valor); }
                const extra = hijos.length ? ` Se encolan sus hijos: ${hijos.join(", ")}.` : " Es nodo hoja.";
                pasos.push({ nodo: nodo.valor, accion: "visitar", acumulado: [...resultado], mensaje: `[Por Niveles - Nivel ${nivel}] Visitamos el nodo ${nodo.valor}.${extra}` });
            }
        }
        return { resultado, pasos, ...this.estadoCompleto() };
    }

    buscarMinimo() {
        const pasos = [];
        if (!this.raiz) return { minimo: null, pasos: [], ...this.estadoCompleto() };
        let actual = this.raiz;
        const camino = [actual.valor];
        while (actual.izquierda) {
            pasos.push({
                nodo: actual.valor,
                accion: "explorar",
                acumulado: [...camino],
                mensaje: `Estamos en ${actual.valor}. Tiene hijo izquierdo (${actual.izquierda.valor}), así que seguimos bajando a la izquierda.`
            });
            actual = actual.izquierda;
            camino.push(actual.valor);
        }
        pasos.push({
            nodo: actual.valor,
            accion: "encontrado",
            acumulado: [actual.valor],
            mensaje: `¡Mínimo encontrado! El nodo ${actual.valor} ya no tiene hijo izquierdo (izquierda = None).`
        });
        return { minimo: actual.valor, pasos, ...this.estadoCompleto() };
    }

    contar(n = this.raiz) { return n ? 1 + this.contar(n.izquierda) + this.contar(n.derecha) : 0; }
    altura(n = this.raiz) { return n ? 1 + Math.max(this.altura(n.izquierda), this.altura(n.derecha)) : 0; }
    sumar(n = this.raiz) { return n ? n.valor + this.sumar(n.izquierda) + this.sumar(n.derecha) : 0; }

    estadoCompleto() {
        return {
            arbol: structuredClone(this.raiz),
            metricas: {
                total_nodos: this.contar(),
                altura: this.altura(),
                suma_nodos: this.sumar()
            }
        };
    }
}

// ============================================================================
// ESTADO DE LA APLICACIÓN Y ANIMADOR PASO A PASO
// ============================================================================
const motorLocal = new MotorLocalBST();
let usarBackendPython = true;
let estadoArbol = null;

// Estado del reproductor paso a paso
let pasosAnimacion = [];
let indicePasoActual = -1;
let temporizadorPlay = null;
let velocidadMs = 800;

// Elementos del DOM
const svgLevels = document.getElementById("svg-levels");
const svgEdges = document.getElementById("svg-edges");
const svgNodes = document.getElementById("svg-nodes");
const stepBadge = document.getElementById("step-badge");
const stepMessage = document.getElementById("step-message");
const stepCounter = document.getElementById("step-counter");
const outputSequence = document.getElementById("output-sequence");
const codigoPython = document.getElementById("codigo-python");
const codigoEtiqueta = document.getElementById("codigo-etiqueta");
const btnPrev = document.getElementById("btn-prev");
const btnPlayPause = document.getElementById("btn-play-pause");
const btnNext = document.getElementById("btn-next");
const selectSpeed = document.getElementById("select-speed");
const backendStatus = document.getElementById("backend-status");

function mostrarCodigoPython(clave, etiqueta) {
    codigoPython.textContent = SNIPPETS_PYTHON[clave] || SNIPPETS_PYTHON.insertar;
    codigoEtiqueta.textContent = etiqueta;
}

// Comunicación híbrida (API Python con respaldo automático)
async function llamarAPI(ruta, metodo = "GET", payload = null) {
    if (usarBackendPython && window.location.protocol.startsWith("http")) {
        try {
            const opciones = { method: metodo, headers: { "Content-Type": "application/json" } };
            if (payload) opciones.body = JSON.stringify(payload);
            const resp = await fetch(ruta, opciones);
            if (resp.ok) {
                backendStatus.textContent = "🐍 Motor Python Activo";
                return await resp.json();
            }
        } catch (e) {
            usarBackendPython = false;
        }
    }
    backendStatus.textContent = "⚡ Motor Interactivo Activo";
    if (ruta === "/api/estado") return motorLocal.estadoCompleto();
    if (ruta === "/api/insertar") return motorLocal.insertarConPasos(payload.valor);
    if (ruta === "/api/reiniciar") { motorLocal.raiz = null; return motorLocal.estadoCompleto(); }
    if (ruta === "/api/ejemplo") {
        motorLocal.raiz = null;
        [10, 5, 15, 3, 7, 20, 6].forEach(v => motorLocal.insertarConPasos(v));
        return motorLocal.estadoCompleto();
    }
    if (ruta.startsWith("/api/recorrer/")) {
        const tipo = ruta.split("/").pop();
        return motorLocal.recorrer(tipo);
    }
    if (ruta === "/api/minimo") return motorLocal.buscarMinimo();
}

// ============================================================================
// CÁLCULO DE COORDENADAS Y DIBUJO SVG DEL ÁRBOL BINARIO
// ============================================================================
function calcularPosiciones(nodo, profundidad = 0, xMin = 40, xMax = 860, mapa = new Map(), listaAristas = []) {
    if (!nodo) return { mapa, listaAristas, maxProfundidad: profundidad };

    const x = (xMin + xMax) / 2;
    const y = 55 + profundidad * 82;
    mapa.set(nodo.valor, { valor: nodo.valor, x, y, profundidad });

    let maxProf = profundidad + 1;

    if (nodo.izquierda) {
        const xHijo = (xMin + x) / 2;
        const yHijo = 55 + (profundidad + 1) * 82;
        listaAristas.push({
            desde: nodo.valor,
            hacia: nodo.izquierda.valor,
            x1: x, y1: y,
            x2: xHijo, y2: yHijo,
            tipo: "<"
        });
        const sub = calcularPosiciones(nodo.izquierda, profundidad + 1, xMin, x, mapa, listaAristas);
        maxProf = Math.max(maxProf, sub.maxProfundidad);
    }

    if (nodo.derecha) {
        const xHijo = (x + xMax) / 2;
        const yHijo = 55 + (profundidad + 1) * 82;
        listaAristas.push({
            desde: nodo.valor,
            hacia: nodo.derecha.valor,
            x1: x, y1: y,
            x2: xHijo, y2: yHijo,
            tipo: ">"
        });
        const sub = calcularPosiciones(nodo.derecha, profundidad + 1, x, xMax, mapa, listaAristas);
        maxProf = Math.max(maxProf, sub.maxProfundidad);
    }

    return { mapa, listaAristas, maxProfundidad: maxProf };
}

function renderizarArbol(pasoActivo = null) {
    svgLevels.innerHTML = "";
    svgEdges.innerHTML = "";
    svgNodes.innerHTML = "";

    if (!estadoArbol) {
        const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
        txt.setAttribute("x", "450");
        txt.setAttribute("y", "220");
        txt.setAttribute("text-anchor", "middle");
        txt.setAttribute("fill", "#356350");
        txt.setAttribute("font-size", "16");
        txt.setAttribute("font-weight", "600");
        txt.textContent = "🌱 El árbol está vacío. Inserta un valor o carga el Árbol de Clase.";
        svgNodes.appendChild(txt);
        return;
    }

    const { mapa, listaAristas, maxProfundidad } = calcularPosiciones(estadoArbol);

    // 1. Dibujar líneas guía de niveles
    for (let niv = 0; niv < maxProfundidad; niv++) {
        const y = 55 + niv * 82;
        const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
        linea.setAttribute("x1", "20");
        linea.setAttribute("y1", y);
        linea.setAttribute("x2", "880");
        linea.setAttribute("y2", y);
        linea.setAttribute("class", "level-line");
        svgLevels.appendChild(linea);

        const etiq = document.createElementNS("http://www.w3.org/2000/svg", "text");
        etiq.setAttribute("x", "26");
        etiq.setAttribute("y", y - 8);
        etiq.setAttribute("class", "level-text");
        etiq.textContent = `Nivel ${niv + 1}`;
        svgLevels.appendChild(etiq);
    }

    // 2. Dibujar conexiones (aristas) entre padres e hijos
    listaAristas.forEach(arista => {
        const linea = document.createElementNS("http://www.w3.org/2000/svg", "line");
        linea.setAttribute("x1", arista.x1);
        linea.setAttribute("y1", arista.y1);
        linea.setAttribute("x2", arista.x2);
        linea.setAttribute("y2", arista.y2);
        const esActiva = pasoActivo && (pasoActivo.nodo === arista.hacia || pasoActivo.nodo === arista.desde);
        linea.setAttribute("class", `tree-edge ${esActiva ? "edge-active" : ""}`);
        svgEdges.appendChild(linea);

        // Etiqueta < o > en el punto medio de la rama
        const mx = (arista.x1 + arista.x2) / 2 + (arista.tipo === "<" ? -10 : 10);
        const my = (arista.y1 + arista.y2) / 2 - 4;
        const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lbl.setAttribute("x", mx);
        lbl.setAttribute("y", my);
        lbl.setAttribute("text-anchor", "middle");
        lbl.setAttribute("class", "edge-label");
        lbl.textContent = arista.tipo;
        svgEdges.appendChild(lbl);
    });

    // 3. Dibujar cada Nodo
    const visitadosLista = (pasoActivo && pasoActivo.acumulado) ? pasoActivo.acumulado : [];

    mapa.forEach(info => {
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        let claseEstado = "";

        if (pasoActivo) {
            if (pasoActivo.nodo === info.valor) {
                if (pasoActivo.accion === "encontrado") claseEstado = "state-found";
                else if (pasoActivo.accion === "visitar" || pasoActivo.accion === "insertar") claseEstado = "state-visited";
                else claseEstado = "state-exploring";
            } else if (visitadosLista.includes(info.valor)) {
                claseEstado = "state-visited";
            }
        }

        g.setAttribute("class", `node-group ${claseEstado}`);

        const circulo = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circulo.setAttribute("cx", info.x);
        circulo.setAttribute("cy", info.y);
        circulo.setAttribute("r", "24");
        circulo.setAttribute("class", "node-circle");
        circulo.setAttribute("filter", "url(#node-shadow)");
        g.appendChild(circulo);

        const texto = document.createElementNS("http://www.w3.org/2000/svg", "text");
        texto.setAttribute("x", info.x);
        texto.setAttribute("y", info.y);
        texto.setAttribute("class", "node-text");
        texto.textContent = info.valor;
        g.appendChild(texto);

        // Si el nodo ya fue visitado en el recorrido, mostrar su número de orden (#1, #2...)
        const ordenIdx = visitadosLista.indexOf(info.valor);
        if (ordenIdx !== -1) {
            const bx = info.x + 18;
            const by = info.y - 18;
            const badge = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            badge.setAttribute("cx", bx);
            badge.setAttribute("cy", by);
            badge.setAttribute("r", "10");
            badge.setAttribute("class", "node-order-badge");
            g.appendChild(badge);

            const btxt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            btxt.setAttribute("x", bx);
            btxt.setAttribute("y", by);
            btxt.setAttribute("class", "node-order-text");
            btxt.textContent = ordenIdx + 1;
            g.appendChild(btxt);
        }

        svgNodes.appendChild(g);
    });
}

function actualizarMetricas(metricas) {
    if (!metricas) return;
    document.getElementById("metrica-nodos").textContent = metricas.total_nodos;
    document.getElementById("metrica-altura").textContent = metricas.altura;
    document.getElementById("metrica-suma").textContent = metricas.suma_nodos;
}

// ============================================================================
// REPRODUCTOR DE ANIMACIÓN PASO A PASO
// ============================================================================
function detenerReproduccion() {
    if (temporizadorPlay) {
        clearInterval(temporizadorPlay);
        temporizadorPlay = null;
    }
    btnPlayPause.textContent = "▶";
}

function renderizarSecuenciaInferior(acumulado = []) {
    outputSequence.innerHTML = "";
    if (!acumulado || acumulado.length === 0) {
        const span = document.createElement("span");
        span.className = "empty-sequence";
        span.textContent = "En espera de nodos visitados...";
        outputSequence.appendChild(span);
        return;
    }

    acumulado.forEach((valor, idx) => {
        if (idx > 0) {
            const flecha = document.createElement("span");
            flecha.className = "seq-arrow";
            flecha.textContent = "→";
            outputSequence.appendChild(flecha);
        }
        const chip = document.createElement("span");
        chip.className = "seq-chip";
        chip.innerHTML = `<span class="seq-index">#${idx + 1}</span> ${valor}`;
        outputSequence.appendChild(chip);
    });
}

function irAPaso(indice) {
    if (pasosAnimacion.length === 0) {
        stepCounter.textContent = "Paso 0 / 0";
        btnPrev.disabled = true;
        btnNext.disabled = true;
        btnPlayPause.disabled = true;
        renderizarArbol(null);
        return;
    }

    indicePasoActual = Math.max(0, Math.min(indice, pasosAnimacion.length - 1));
    const paso = pasosAnimacion[indicePasoActual];

    stepBadge.textContent = `Paso ${indicePasoActual + 1} de ${pasosAnimacion.length}`;
    stepMessage.textContent = paso.mensaje;
    stepCounter.textContent = `Paso ${indicePasoActual + 1} / ${pasosAnimacion.length}`;

    btnPrev.disabled = indicePasoActual === 0;
    btnNext.disabled = indicePasoActual === pasosAnimacion.length - 1;
    btnPlayPause.disabled = false;

    if (paso.acumulado) {
        renderizarSecuenciaInferior(paso.acumulado);
    } else if (paso.accion === "insertar") {
        renderizarSecuenciaInferior([paso.nodo]);
    }

    renderizarArbol(paso);

    if (indicePasoActual === pasosAnimacion.length - 1) {
        detenerReproduccion();
    }
}

function iniciarAnimacion(pasos) {
    detenerReproduccion();
    pasosAnimacion = pasos || [];
    if (pasosAnimacion.length === 0) {
        irAPaso(0);
        return;
    }
    irAPaso(0);
    if (pasosAnimacion.length > 1) {
        alternarPlayPause();
    }
}

function alternarPlayPause() {
    if (temporizadorPlay) {
        detenerReproduccion();
        return;
    }
    if (indicePasoActual >= pasosAnimacion.length - 1) {
        indicePasoActual = -1;
    }
    btnPlayPause.textContent = "⏸";
    temporizadorPlay = setInterval(() => {
        if (indicePasoActual < pasosAnimacion.length - 1) {
            irAPaso(indicePasoActual + 1);
        } else {
            detenerReproduccion();
        }
    }, velocidadMs);
}

// ============================================================================
// EVENTOS DE INTERFAZ DE USUARIO
// ============================================================================
document.getElementById("form-insertar").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("input-valor");
    const valor = parseInt(input.value, 10);
    if (Number.isNaN(valor)) return;

    mostrarCodigoPython("insertar", `insertar(raiz, ${valor})`);
    const datos = await llamarAPI("/api/insertar", "POST", { valor });
    estadoArbol = datos.arbol;
    actualizarMetricas(datos.metricas);
    iniciarAnimacion(datos.pasos);
    input.value = "";
    input.focus();
});

document.getElementById("btn-aleatorio").addEventListener("click", async () => {
    const candidatos = [2, 4, 6, 8, 9, 11, 12, 14, 17, 18, 22, 25, 1, 13, 19];
    const valor = candidatos[Math.floor(Math.random() * candidatos.length)];
    mostrarCodigoPython("insertar", `insertar(raiz, ${valor})`);
    const datos = await llamarAPI("/api/insertar", "POST", { valor });
    estadoArbol = datos.arbol;
    actualizarMetricas(datos.metricas);
    iniciarAnimacion(datos.pasos);
});

document.getElementById("btn-ejemplo").addEventListener("click", async () => {
    detenerReproduccion();
    mostrarCodigoPython("insertar", "Árbol de Clase");
    const datos = await llamarAPI("/api/ejemplo", "POST");
    estadoArbol = datos.arbol;
    actualizarMetricas(datos.metricas);
    pasosAnimacion = [];
    stepBadge.textContent = "Árbol Cargado";
    stepMessage.textContent = "Se cargó el árbol de nuestra clase: [10, 5, 15, 3, 7, 20, 6]. ¡Elige un recorrido!";
    renderizarSecuenciaInferior([]);
    renderizarArbol(null);
});

document.getElementById("btn-limpiar").addEventListener("click", async () => {
    detenerReproduccion();
    const datos = await llamarAPI("/api/reiniciar", "POST");
    estadoArbol = datos.arbol;
    actualizarMetricas(datos.metricas);
    pasosAnimacion = [];
    stepBadge.textContent = "Árbol Vacío";
    stepMessage.textContent = "Se vació el árbol. Inserta un primer número para crear la nueva Raíz.";
    renderizarSecuenciaInferior([]);
    renderizarArbol(null);
});

document.querySelectorAll(".btn-traversal").forEach(boton => {
    boton.addEventListener("click", async () => {
        document.querySelectorAll(".btn-traversal").forEach(b => b.classList.remove("active"));
        boton.classList.add("active");

        const tipo = boton.dataset.recorrido;
        mostrarCodigoPython(tipo, `${tipo}(raiz)`);
        const datos = await llamarAPI(`/api/recorrer/${tipo}`);
        estadoArbol = datos.arbol;
        actualizarMetricas(datos.metricas);
        iniciarAnimacion(datos.pasos);
    });
});

document.getElementById("btn-minimo").addEventListener("click", async () => {
    document.querySelectorAll(".btn-traversal").forEach(b => b.classList.remove("active"));
    mostrarCodigoPython("minimo", "encontrar_minimo(raiz)");
    const datos = await llamarAPI("/api/minimo");
    estadoArbol = datos.arbol;
    actualizarMetricas(datos.metricas);
    iniciarAnimacion(datos.pasos);
});

btnPrev.addEventListener("click", () => {
    detenerReproduccion();
    irAPaso(indicePasoActual - 1);
});

btnNext.addEventListener("click", () => {
    detenerReproduccion();
    irAPaso(indicePasoActual + 1);
});

btnPlayPause.addEventListener("click", () => {
    alternarPlayPause();
});

selectSpeed.addEventListener("change", (e) => {
    velocidadMs = parseInt(e.target.value, 10);
    if (temporizadorPlay) {
        detenerReproduccion();
        alternarPlayPause();
    }
});

// ============================================================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================================================
(async function inicializarLaboratorio() {
    // Inicializar también el motor de respaldo con el árbol de clase
    [10, 5, 15, 3, 7, 20, 6].forEach(v => motorLocal.insertarConPasos(v));
    mostrarCodigoPython("insertar", "insertar(nodo, valor)");

    const datos = await llamarAPI("/api/estado");
    estadoArbol = datos.arbol;
    actualizarMetricas(datos.metricas);
    renderizarArbol(null);
})();
