/* =========================================================
   UTILIDADES GENERALES
========================================================= */

const obtenerTurnos = () => JSON.parse(localStorage.getItem("turnos")) || [];
const guardarTurnos = (turnos) => localStorage.setItem("turnos", JSON.stringify(turnos));

const obtenerContratos = () => JSON.parse(localStorage.getItem("contratos")) || [];
const guardarContratos = (contratos) => localStorage.setItem("contratos", JSON.stringify(contratos));

const formatearPrecio = (valor) => `$${Number(valor).toLocaleString("es-AR")}`;

const mostrarError = (inputId, mensaje) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    let error = document.getElementById(`${inputId}-error`);

    if (!error) {
        error = document.createElement("small");
        error.id = `${inputId}-error`;
        error.classList.add("text-danger", "d-block", "mt-1");
        input.parentNode.appendChild(error);
    }

    error.textContent = mensaje;
};

const limpiarErrores = () => {
    document.querySelectorAll("[id$='-error']").forEach((el) => {
        if (el.classList.contains("text-danger")) {
            el.remove();
        }
    });
};

const ordenarTurnosPorFecha = (turnos) => {
    return [...turnos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
};

/* =========================================================
   ALERTAS
========================================================= */

const alertaErrorDatos = (mensaje) => {
    Swal.fire({
        icon: "error",
        title: "Datos incorrectos",
        text: mensaje,
        confirmButtonColor: "#dc3545"
    });
};

const alertaExito = (titulo, texto) => {
    Swal.fire({
        icon: "success",
        title: titulo,
        text: texto,
        confirmButtonColor: "#198754"
    });
};

/* =========================================================
   TURNOS - FORMULARIO PÚBLICO
========================================================= */

const agregarTurnoDesdeContacto = (e) => {
    e.preventDefault();
    limpiarErrores();

    const nombre = document.getElementById("nombre-contacto")?.value.trim() || "";
    const email = document.getElementById("email-contacto")?.value.trim() || "";
    const especialidad = document.getElementById("especialidad-contacto")?.value || "";
    const fecha = document.getElementById("fecha-contacto")?.value || "";
    const hora = document.getElementById("hora-contacto")?.value || "";

    let errores = false;

    if (!nombre || !/^[a-zA-ZÀ-ÿ\s]+$/.test(nombre)) {
        mostrarError("nombre-contacto", "Por favor, ingresá un nombre válido.");
        errores = true;
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        mostrarError("email-contacto", "Por favor, ingresá un correo válido.");
        errores = true;
    }

    if (!especialidad) {
        mostrarError("especialidad-contacto", "Por favor, seleccioná una especialidad.");
        errores = true;
    }

    const hoy = new Date().toISOString().split("T")[0];
    if (!fecha || fecha < hoy) {
        mostrarError("fecha-contacto", "Seleccioná una fecha válida.");
        errores = true;
    }

    if (!hora) {
        mostrarError("hora-contacto", "Por favor, seleccioná un horario.");
        errores = true;
    }

    if (errores) {
        alertaErrorDatos("Corregí los errores antes de solicitar el turno.");
        return;
    }

    const turnos = obtenerTurnos();

    const turnoExistente = turnos.some(
        (turno) =>
            turno.especialidad === especialidad &&
            turno.fecha === fecha &&
            turno.hora === hora
    );

    if (turnoExistente) {
        Swal.fire({
            icon: "warning",
            title: "Horario no disponible",
            html: `
                <p>Ya existe un turno para <strong>${especialidad}</strong>.</p>
                <p>Fecha: <strong>${fecha}</strong></p>
                <p>Horario: <strong>${hora}</strong></p>
                <p class="mt-3">Por favor, seleccioná otra combinación disponible.</p>
            `,
            confirmButtonText: "Entendido",
            customClass: {
                popup: "swal-biome-popup",
                title: "swal-biome-title",
                htmlContainer: "swal-biome-html",
                confirmButton: "swal-biome-confirm"
            },
            buttonsStyling: false
        });
        return;
    }

    turnos.push({ nombre, email, especialidad, fecha, hora });
    guardarTurnos(turnos);

    Swal.fire({
        icon: "success",
        title: "Turno solicitado",
        html: `
            <p><strong>${nombre}</strong>, tu solicitud fue registrada correctamente.</p>
            <p>Especialidad: <strong>${especialidad}</strong></p>
            <p>Fecha: <strong>${fecha}</strong></p>
            <p>Horario: <strong>${hora}</strong></p>
        `,
        confirmButtonText: "Aceptar",
        customClass: {
            popup: "swal-biome-popup",
            title: "swal-biome-title",
            htmlContainer: "swal-biome-html",
            confirmButton: "swal-biome-confirm"
        },
        buttonsStyling: false
    });

    const formulario = document.getElementById("form-turno-contacto");
    if (formulario) formulario.reset();

    renderizarTurnosRecepcion();
};
/* =========================================================
   PANEL DE TURNOS
========================================================= */

const renderizarTurnosRecepcion = () => {
    const tablaTurnos = document.getElementById("tabla-turnos");
    const cardsMobile = document.getElementById("turnos-cards-mobile");
    const contadorTurnos = document.getElementById("contador-turnos");
    const estadoVacio = document.getElementById("estado-vacio-turnos");

    const turnos = ordenarTurnosPorFecha(obtenerTurnos());

    if (tablaTurnos) tablaTurnos.innerHTML = "";
    if (cardsMobile) cardsMobile.innerHTML = "";

    if (contadorTurnos) {
        contadorTurnos.textContent = turnos.length;
    }

    if (estadoVacio) {
        estadoVacio.classList.toggle("d-none", turnos.length !== 0);
    }

    if (turnos.length === 0) return;

    turnos.forEach((turno, index) => {
        if (tablaTurnos) {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td><strong>${turno.nombre}</strong></td>
                <td>${turno.email}</td>
                <td>${turno.especialidad}</td>
                <td>${turno.fecha}</td>
                <td>${turno.hora}</td>
                <td class="text-center">
                    <button class="btn btn-outline-danger btn-sm btn-eliminar-turno" data-index="${index}" aria-label="Eliminar turno">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            `;
            tablaTurnos.appendChild(fila);
        }

        if (cardsMobile) {
            const card = document.createElement("div");
            card.className = "turno-mobile-card p-4 mb-3";

            card.innerHTML = `
                <div class="turno-mobile-header">
                    <div>
                        <h3 class="turno-mobile-paciente">${turno.nombre}</h3>
                        <p class="turno-mobile-especialidad">${turno.especialidad}</p>
                    </div>
                    <button class="btn btn-outline-danger btn-sm btn-eliminar-turno" data-index="${index}" aria-label="Eliminar turno">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>

                <div class="turno-mobile-body">
                    <div class="turno-mobile-item">
                        <i class="bi bi-envelope turno-mobile-icon"></i>
                        <div>
                            <span class="turno-mobile-label">Correo</span>
                            <span class="turno-mobile-value">${turno.email}</span>
                        </div>
                    </div>

                    <div class="turno-mobile-item">
                        <i class="bi bi-calendar-event turno-mobile-icon"></i>
                        <div>
                            <span class="turno-mobile-label">Fecha</span>
                            <span class="turno-mobile-value">${turno.fecha}</span>
                        </div>
                    </div>

                    <div class="turno-mobile-item">
                        <i class="bi bi-clock turno-mobile-icon"></i>
                        <div>
                            <span class="turno-mobile-label">Horario</span>
                            <span class="turno-mobile-value">${turno.hora}</span>
                        </div>
                    </div>
                </div>
            `;

            cardsMobile.appendChild(card);
        }
    });
};
const eliminarTurno = (index) => {
    Swal.fire({
        title: "¿Eliminar turno?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
        customClass: {
            popup: "swal-biome-popup",
            title: "swal-biome-title",
            htmlContainer: "swal-biome-html",
            confirmButton: "swal-biome-confirm",
            cancelButton: "swal-biome-cancel"
        },
        buttonsStyling: false
    }).then((result) => {
        if (!result.isConfirmed) return;

        const turnos = obtenerTurnos();
        turnos.splice(index, 1);
        guardarTurnos(turnos);

        renderizarTurnosRecepcion();

        Swal.fire({
            icon: "success",
            title: "Turno eliminado",
            text: "El turno fue eliminado correctamente.",
            customClass: {
                popup: "swal-biome-popup",
                title: "swal-biome-title",
                htmlContainer: "swal-biome-html",
                confirmButton: "swal-biome-confirm"
            },
            buttonsStyling: false
        });
    });
};

const conectarEventosPanel = () => {
    document.addEventListener("click", (e) => {
        const botonEliminar = e.target.closest(".btn-eliminar-turno");
        if (!botonEliminar) return;

        const index = Number(botonEliminar.dataset.index);
        eliminarTurno(index);
    });
};

/* =========================================================
   PLANES DE SALUD
========================================================= */

const calcularPlanSalud = (edad, zona, trabajo, personas) => {
    let plan = { nombre: "Plan Básico", precio: 50000 };

    if (edad > 40) {
        plan = { nombre: "Plan Intermedio", precio: 100000 };
    }

    if (zona === "Capital") {
        plan.precio += 20000;
    }

    if (trabajo === "Independiente") {
        plan.precio += 30000;
    }

    if (personas > 3) {
        plan.precio += (personas - 3) * 10000;
    }

    return plan;
};

const seleccionarPlan = (nombre, beneficios) => {
    Swal.fire({
        title: `Detalles del ${nombre}`,
        html: `
            <p><strong>Beneficios incluidos:</strong></p>
            <p>${beneficios}</p>
            <p class="mt-3">¿Querés cotizar este plan?</p>
        `,
        icon: "info",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Cotizar plan",
        denyButtonText: "Volver al inicio",
        cancelButtonText: "Cancelar",
        customClass: {
            popup: "swal-biome-popup",
            title: "swal-biome-title",
            htmlContainer: "swal-biome-html",
            confirmButton: "swal-biome-confirm",
            denyButton: "swal-biome-deny",
            cancelButton: "swal-biome-cancel"
        },
        buttonsStyling: false
    }).then((result) => {
        if (result.isConfirmed) {
            const formulario = document.getElementById("form-simulador");
            if (formulario) {
                formulario.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        } else if (result.isDenied) {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
};

const mostrarPlanesResumen = (planes) => {
    const contenedor = document.getElementById("planes-container");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    planes.forEach((plan) => {
        const beneficiosTexto = plan.beneficios.join(", ").replace(/'/g, "\\'");

        contenedor.innerHTML += `
            <div class="col-md-6 col-lg-4">
                <div class="card">
                    <h3 class="card-title h4">${plan.nombre}</h3>
                    <p class="plan-price">${formatearPrecio(plan.precio)}</p>
                    <ul>
                        ${plan.beneficios.map((beneficio) => `<li>${beneficio}</li>`).join("")}
                    </ul>
                    <button 
                        type="button"
                        class="btn btn-biome w-100 mt-auto btn-ver-plan"
                        data-nombre="${plan.nombre}"
                        data-beneficios="${beneficiosTexto}">
                        Ver detalle
                    </button>
                </div>
            </div>
        `;
    });
};

const conectarEventosPlanes = () => {
    const contenedor = document.getElementById("planes-container");
    if (!contenedor) return;

    contenedor.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-ver-plan");
        if (!boton) return;

        const nombre = boton.dataset.nombre;
        const beneficios = boton.dataset.beneficios;

        seleccionarPlan(nombre, beneficios);
    });
};

const cotizarPlan = (e) => {
    e.preventDefault();
    limpiarErrores();

    const nombre = document.getElementById("nombre")?.value.trim() || "";
    const edad = document.getElementById("edad")?.value.trim() || "";
    const zona = document.getElementById("zona")?.value || "";
    const trabajo = document.getElementById("trabajo")?.value || "";
    const personas = document.getElementById("personas")?.value.trim() || "";

    let errores = false;

    if (!nombre || !/^[a-zA-ZÀ-ÿ\s]+$/.test(nombre)) {
        mostrarError("nombre", "Por favor, ingresá un nombre válido.");
        errores = true;
    }

    if (!edad || isNaN(edad) || edad < 18 || edad > 99) {
        mostrarError("edad", "La edad debe estar entre 18 y 99 años.");
        errores = true;
    }

    if (!zona) {
        mostrarError("zona", "Por favor, seleccioná una zona.");
        errores = true;
    }

    if (!trabajo) {
        mostrarError("trabajo", "Por favor, seleccioná tu situación laboral.");
        errores = true;
    }

    if (!personas || isNaN(personas) || personas < 1 || personas > 10) {
        mostrarError("personas", "Ingresá un número válido de personas (1 a 10).");
        errores = true;
    }

    if (errores) {
        alertaErrorDatos("Corregí los errores antes de cotizar.");
        return;
    }

    const planRecomendado = calcularPlanSalud(
        parseInt(edad, 10),
        zona,
        trabajo,
        parseInt(personas, 10)
    );

    Swal.fire({
        title: "Plan recomendado",
        html: `
            <p><strong>${nombre}</strong>, según los datos ingresados te recomendamos el:</p>
            <p><strong>${planRecomendado.nombre}</strong></p>
            <p>Costo mensual estimado: <strong>${formatearPrecio(planRecomendado.precio)}</strong></p>
            <p class="mt-3">¿Querés continuar con la solicitud?</p>
        `,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Contratar plan",
        cancelButtonText: "Cancelar",
        customClass: {
            popup: "swal-biome-popup",
            title: "swal-biome-title",
            htmlContainer: "swal-biome-html",
            confirmButton: "swal-biome-confirm",
            cancelButton: "swal-biome-cancel"
        },
        buttonsStyling: false
    }).then((result) => {
        if (result.isConfirmed) {
            contratarPlan(planRecomendado, nombre);
        }
    });
};

const contratarPlan = (plan, nombre) => {
    const contratos = obtenerContratos();
    contratos.push({ nombre, plan: plan.nombre, precio: plan.precio });
    guardarContratos(contratos);

    Swal.fire({
        title: "Solicitud registrada",
        html: `
            <p><strong>${nombre}</strong>, tu solicitud para el</p>
            <p><strong>${plan.nombre}</strong> fue registrada correctamente.</p>
            <p>Nos pondremos en contacto para continuar el proceso.</p>
        `,
        icon: "success",
        confirmButtonText: "Aceptar",
        customClass: {
            popup: "swal-biome-popup",
            title: "swal-biome-title",
            htmlContainer: "swal-biome-html",
            confirmButton: "swal-biome-confirm"
        },
        buttonsStyling: false
    });

    const formulario = document.getElementById("form-simulador");
    if (formulario) formulario.reset();
};

const cargarPlanes = async () => {
    try {
        const respuesta = await fetch("js/planes.json");
        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los planes.");
        }

        const planes = await respuesta.json();
        mostrarPlanesResumen(planes);
    } catch (error) {
        console.error("Error al cargar los planes:", error);
    }
};

/* =========================================================
   ACCESO PROFESIONAL
========================================================= */

const conectarAccesoRecepcion = () => {
    const accesoRecepcion = document.getElementById("accesoRecepcion");
    if (!accesoRecepcion) return;

    accesoRecepcion.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "turnos.html";
    });
};

/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const formularioPlanes = document.getElementById("form-simulador");
    const formularioTurnos = document.getElementById("form-turno-contacto");

    if (formularioPlanes) {
        formularioPlanes.addEventListener("submit", cotizarPlan);
    }

    if (formularioTurnos) {
        formularioTurnos.addEventListener("submit", agregarTurnoDesdeContacto);
    }

    conectarAccesoRecepcion();
    conectarEventosPanel();
    conectarEventosPlanes();

    renderizarTurnosRecepcion();
    cargarPlanes();
});