
const mostrarError = (inputId, mensaje) => {
    let input = document.getElementById(inputId);
    let error = document.getElementById(inputId + "-error");

    if (!error) {
        error = document.createElement("small");
        error.id = inputId + "-error";
        error.classList.add("text-danger");
        input.parentNode.appendChild(error);
    }

    error.textContent = mensaje;
};


const limpiarErrores = () => {
    document.querySelectorAll(".text-danger").forEach((el) => el.remove());
    
};


const agregarTurnoDesdeContacto = (e) => {
    e.preventDefault();
    limpiarErrores(); 

    const nombre = document.getElementById("nombre-contacto").value.trim();
    const email = document.getElementById("email-contacto").value.trim();
    const especialidad = document.getElementById("especialidad-contacto").value;
    const fecha = document.getElementById("fecha-contacto").value;
    const hora = document.getElementById("hora-contacto").value;

    let errores = false;

    
    if (!nombre || !/^[a-zA-Z\s]+$/.test(nombre)) {
        mostrarError("nombre-contacto", "Por favor, ingresa un nombre válido.");
        errores = true;
    }

    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        mostrarError("email-contacto", "Por favor, ingresa un correo válido.");
        errores = true;
    }

   
    if (!especialidad) {
        mostrarError("especialidad-contacto", "Por favor, selecciona una especialidad.");
        errores = true;
    }

    
    const hoy = new Date().toISOString().split("T")[0];
    if (!fecha || fecha < hoy) {
        mostrarError("fecha-contacto", "Selecciona una fecha válida (no en el pasado).");
        errores = true;
    }

    
    if (!hora) {
        mostrarError("hora-contacto", "Por favor, selecciona un horario.");
        errores = true;
    }

    
    if (errores) {
        Swal.fire({
            icon: 'error',
            title: 'Datos Incorrectos',
            text: 'Corrige los errores antes de solicitar el turno.',
            confirmButtonColor: '#dc3545'
        });
        return;
    }

    
    let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    const turnoExistente = turnos.some(turno => turno.especialidad === especialidad && turno.fecha === fecha && turno.hora === hora);

    if (turnoExistente) {
        Swal.fire({
            icon: 'warning',
            title: 'Horario No Disponible',
            text: `Ya hay un turno en ${especialidad} a las ${hora}. Por favor, elige otro horario.`,
            confirmButtonColor: '#17a2b8'
        });
        return;
    }

    turnos.push({ nombre, email, especialidad, fecha, hora });
    localStorage.setItem("turnos", JSON.stringify(turnos));

    Swal.fire({
        icon: 'success',
        title: 'Turno Solicitado',
        text: 'Tu turno ha sido registrado. Recibirás un correo con la confirmación.',
        confirmButtonColor: '#198754'
    });

    document.getElementById("form-turno-contacto").reset();
    renderizarTurnos();
    renderizarTurnosRecepcion();
};



const renderizarTurnos = () => {
    let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    const listaTurnosContainer = document.getElementById("tabla-turnos");
    if (!listaTurnosContainer) return;

    turnos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    listaTurnosContainer.innerHTML = "";
    turnos.forEach((turno, index) => {
        listaTurnosContainer.innerHTML += `
            <div class="card p-3 mb-2 shadow-sm d-flex justify-content-between align-items-center">
                <div><strong>${turno.nombre}</strong> - ${turno.especialidad} - 📆 ${turno.fecha} - ⏰ ${turno.hora}</div>
                <button class="btn btn-outline-danger btn-sm btn-delete" onclick="eliminarTurno(${index})"><i class="bi bi-trash-fill"></i></button>
            </div>`;
    });
};


const renderizarTurnosRecepcion = () => {
    let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
    const tablaTurnos = document.getElementById("tabla-turnos");
    if (!tablaTurnos) return;

    turnos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    tablaTurnos.innerHTML = "";
    turnos.forEach((turno, index) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `<td>${turno.nombre}</td><td>${turno.email}</td><td>${turno.especialidad}</td><td>${turno.fecha}</td><td>${turno.hora}</td>
            <td><button class="btn btn-outline-danger btn-sm" onclick="eliminarTurno(${index})"><i class="bi bi-trash"></i></button></td>`;
        tablaTurnos.appendChild(fila);
    });
};


const eliminarTurno = (index) => {
    Swal.fire({
        title: '¿Estás seguro?', text: "No podrás recuperar este turno.", icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#dc3545', cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            let turnos = JSON.parse(localStorage.getItem("turnos")) || [];
            turnos.splice(index, 1);
            localStorage.setItem("turnos", JSON.stringify(turnos));
            renderizarTurnos();
            renderizarTurnosRecepcion();
            Swal.fire('Eliminado', 'El turno ha sido eliminado correctamente.', 'success');
        }
    });
};


const calcularPlanSalud = (edad, zona, trabajo, personas) => {
    let plan = { nombre: "Plan Básico", precio: 50000 };
    if (edad > 40) plan = { nombre: "Plan Intermedio", precio: 100000 };
    if (zona === "Capital") plan.precio += 20000;
    if (trabajo === "Independiente") plan.precio += 30000;
    if (personas > 3) plan.precio += (personas - 3) * 10000;
    return plan;
};

const planesSalud = [
    { nombre: "Plan Básico", precio: 50000, descripcion: "Cobertura esencial para consultas médicas y urgencias menores." },
    { nombre: "Plan Intermedio", precio: 100000, descripcion: "Incluye estudios avanzados y cobertura extendida." },
    { nombre: "Plan Premium", precio: 150000, descripcion: "Cobertura total con atención VIP y cirugías programadas." }
];



const seleccionarPlan = (nombre, beneficios) => {
    Swal.fire({
        title: `Detalles del ${nombre}`,
        html: `<p><strong>Beneficios:</strong> ${beneficios}</p>
               <p>¿Quieres cotizar este plan o volver al inicio?</p>`,
        icon: "info",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Cotizar este Plan",
        denyButtonText: "Volver al Inicio",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#28a745",
        denyButtonColor: "#6c757d",
        cancelButtonColor: "#dc3545"
    }).then((result) => {
        if (result.isConfirmed) {
           
            document.getElementById("form-simulador").scrollIntoView({ behavior: "smooth" });
        } else if (result.isDenied) {
            
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
};




const mostrarPlanesResumen = (planes) => {
    const contenedor = document.getElementById("planes-container");
    if (!contenedor) return;

    contenedor.innerHTML = ""; 
    planes.forEach(plan => {
        contenedor.innerHTML += `
            <div class="col-md-4">
                <div class="card shadow-sm p-3 mb-4 text-center">
                    <h3 class="card-title text-info">${plan.nombre}</h3>
                    <p class="card-text">${plan.beneficios.join(", ")}</p>
                    <button class="btn btn-info btn-sm" onclick="seleccionarPlan('${plan.nombre}', '${plan.beneficios.join(", ")}')">Ver Detalles</button>
                </div>
            </div>
        `;
    });
};





const cotizarPlan = (e) => {
    e.preventDefault();
    limpiarErrores(); 

    const nombre = document.getElementById("nombre").value.trim();
    const edad = document.getElementById("edad").value.trim();
    const zona = document.getElementById("zona").value;
    const trabajo = document.getElementById("trabajo").value;
    const personas = document.getElementById("personas").value.trim();

    let errores = false;

    
    if (!nombre || !/^[a-zA-Z\s]+$/.test(nombre)) {
        mostrarError("nombre", "Por favor, ingresa un nombre válido.");
        errores = true;
    }

    if (!edad || isNaN(edad) || edad < 18 || edad > 99) {
        mostrarError("edad", "La edad debe estar entre 18 y 99 años.");
        errores = true;
    }

    
    if (!zona) {
        mostrarError("zona", "Por favor, selecciona una zona.");
        errores = true;
    }

    if (!trabajo) {
        mostrarError("trabajo", "Por favor, selecciona tu tipo de trabajo.");
        errores = true;
    }

    
    if (!personas || isNaN(personas) || personas < 1 || personas > 10) {
        mostrarError("personas", "Debes ingresar un número válido de personas (1-10).");
        errores = true;
    }

    if (errores) {
        Swal.fire({
            icon: 'error',
            title: 'Datos Incorrectos',
            text: 'Por favor, corrige los errores antes de cotizar.',
            confirmButtonColor: '#dc3545'
        });
        return;
    }

   
    const planRecomendado = calcularPlanSalud(parseInt(edad), zona, trabajo, parseInt(personas));

    Swal.fire({
        title: "Plan Recomendado",
        html: `<strong>${nombre}</strong>, te recomendamos el <strong>${planRecomendado.nombre}</strong>.<br>
               Costo mensual estimado: <strong>$${planRecomendado.precio}</strong>`,
        icon: "info",
        confirmButtonText: "Contratar Plan",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#dc3545"
    }).then((result) => {
        if (result.isConfirmed) {
            contratarPlan(planRecomendado, nombre);
        }
    });
};



const contratarPlan = (plan, nombre) => {
    Swal.fire({
        title: "¡Contrato Exitoso!",
        html: `<strong>${nombre}</strong>, tu solicitud para el <strong>${plan.nombre}</strong> ha sido registrada.<br>
               Nos pondremos en contacto contigo para finalizar el proceso.`,
        icon: "success",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#198754"
    });

    
    let contratos = JSON.parse(localStorage.getItem("contratos")) || [];
    contratos.push({ nombre, plan: plan.nombre, precio: plan.precio });
    localStorage.setItem("contratos", JSON.stringify(contratos));

  
    document.getElementById("form-simulador").reset();
};


const cargarPlanes = async () => {
    try {
        const respuesta = await fetch("js/planes.json");
        if (!respuesta.ok) throw new Error("Error al cargar los planes");
        const planes = await respuesta.json();
        mostrarPlanesResumen(planes);
    } catch (error) {
        console.error("Error al cargar los planes:", error);
    }
};


const mostrarPlanes = (planes) => {
    const contenedor = document.getElementById("planes-lista");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    planes.forEach(plan => {
        contenedor.innerHTML += `
            <div class="card-plan">
                <h3 class="card-title">${plan.nombre}</h3>
                <p><strong>Precio:</strong> $${plan.precio}</p>
                <ul>${plan.beneficios.map(b => `<li>${b}</li>`).join('')}</ul>
                <button class="btn btn-info">Seleccionar</button>
            </div>
        `;
    });
};


document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("form-simulador")) document.getElementById("form-simulador").addEventListener("submit", cotizarPlan);
    if (document.getElementById("form-turno-contacto")) document.getElementById("form-turno-contacto").addEventListener("submit", agregarTurnoDesdeContacto);
    renderizarTurnos();
    renderizarTurnosRecepcion();
    cargarPlanes();
    
});