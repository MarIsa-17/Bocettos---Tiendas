import {
  cargarDatos,
  guardarDatos,
  mostrarAlerta,
  navegarA
} from "./utils.js";

//comprobamos si estamos loggeados
if(cargarDatos('userLogged').length === 0){
  navegarA('../index.html')
}

const SALES_KEY = "app_sales";

const ventaSeleccionada = cargarDatos("ventaSeleccionada");
guardarDatos("ventaPorActualizar", ventaSeleccionada);

let ventaPorActualizar = cargarDatos("ventaPorActualizar");
console.log(ventaPorActualizar);

let productosVentaActual = ventaPorActualizar.productos;

const OPCIONES_VENTA = {
  canalVenta: ["Web", "Tienda Física", "Instagram", "Facebook", "WhatsApp"],
  tipoVenta: ["Venta Directa", "Cotización", "Venta a Crédito"],
  medioPago: ["Efectivo", "Tarjeta de Crédito", "Transferencia", "Yape/Plin"],
  tipoEntrega: ["Recojo en Tienda", "Envío local", "Envío nacional"],
};

const INVENTORY_PATH = "/csvs/inventario.csv";
// Variable para el inventario cargado del CSV
let inventarioProductos = [];

document.addEventListener("DOMContentLoaded", () => {
  //Rellenar los selects
  inicializarSelectsVenta();
  // Rellenar inventario
  cargarInventarioCSV();
  // llenar datos de venta
  llenarDatosVenta(ventaPorActualizar);
  // llenar datos de cliente
  llenarDatosCliente(ventaPorActualizar);
  // renderizar tabla de productos
  renderDetalleVenta(ventaPorActualizar);

  //Evento del boton Actualizar Producto
  document
    .getElementById("btnActualizarProducto")
    .addEventListener("click", actualizarProducto);

  //Evento de actualizar Venta
  document
    .getElementById("ventaForm")
    .addEventListener("submit", actualizarVenta);

    document.getElementById('btnRegresar').addEventListener('click', () => navegarA('detalle-venta.html'))
});

function cargarInventarioCSV() {
  Papa.parse(INVENTORY_PATH, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      if (results.data.length === 0 || results.errors.length > 0) {
        mostrarAlerta(
          "error",
          "Error de Carga",
          "No se pudo cargar el inventario de productos desde el CSV."
        );
        return;
      }
      inventarioProductos = results.data;
      poblarSelectProductos();
    },
    error: function (error) {
      mostrarAlerta(
        "error",
        "Error de Carga",
        `Error al acceder al CSV: ${error.message}. Asegúrate de usar Live Server.`
      );
    },
  });
}

function poblarSelectProductos() {
  const select = document.getElementById("productoSelect");
  select.innerHTML =
    '<option value="" disabled selected>Selecciona un producto</option>';

  const productosDisponibles = inventarioProductos.filter(
    (p) => p.disponible === "TRUE"
  );

  productosDisponibles.forEach((producto) => {
    const optionElement = document.createElement("option");
    // Usamos el id_producto como valor para buscarlo fácilmente luego
    optionElement.value = producto.id_producto;
    optionElement.textContent = `${producto.nombre}`;
    select.appendChild(optionElement);
  });
}

// Funciones de renderizado
function inicializarSelectsVenta() {
  for (const key in OPCIONES_VENTA) {
    const select = document.getElementById(key);
    if (select) {
      // Añadir la opción por defecto
      select.innerHTML =
        '<option value="" disabled selected>Selecciona una opción</option>';

      OPCIONES_VENTA[key].forEach((opcion) => {
        const optionElement = document.createElement("option");
        optionElement.value = opcion;
        optionElement.textContent = opcion;
        select.appendChild(optionElement);
      });
    }
  }
}

function llenarDatosVenta(venta) {
  document.getElementById("canalVenta").value = venta.canal_venta;
  document.getElementById("tipoVenta").value = venta.tipo_venta;
  document.getElementById("medioPago").value = venta.medio_pago;
  document.getElementById("tipoEntrega").value = venta.tipo_entrega;
  document.getElementById("comentario").value = venta.comentario;
}

function llenarDatosCliente(venta) {
  document.getElementById("clienteNombre").value = venta.cliente.nombre;
  document.getElementById("clienteDNI").value = venta.cliente.dni;
  document.getElementById("clienteDireccion").value = venta.cliente.direccion;
  document.getElementById("clienteDistrito").value = venta.cliente.distrito;
  document.getElementById("clienteProvincia").value = venta.cliente.provincia;
}

function renderDetalleVenta(venta) {
  const tbody = document.getElementById("detalleVentaBody");
  tbody.innerHTML = "";
  let subtotal = 0;

  let productos = venta.productos;

  if (productos.length === 0) {
    // La fila de vacío ahora debe usar colspan="5"
    const emptyRow = `<tr><td colspan="5" class="px-4 py-3 text-center text-gray-500">Aún no hay productos en la venta.</td></tr>`;
    tbody.innerHTML = emptyRow;
  } else {
    productos.forEach((producto) => {
      subtotal += producto.precio_total;
      // Template de la fila incluyendo la nueva columna y el botón
      const row = `
                <tr id="row-${producto.id_producto}">
                    <td class="px-4 py-3 border-r border-gray-200 text-sm">${
                      producto.id_producto
                    }</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm">${
                      producto.nombre
                    }</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm text-center">${
                      producto.cantidad
                    }</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm text-right">S/. ${producto.precio_total.toFixed(
                      2
                    )}</td>
                    <td class="px-4 py-3 text-center">
                        <button type="button" 
                                data-id="${producto.id_producto}" 
                                class="btn-eliminar-producto text-red-500 hover:text-red-700 font-bold p-1 rounded transition duration-150">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    // Asignar eventos a los botones después de que las filas son insertadas en el DOM
    document.querySelectorAll(".btn-eliminar-producto").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id_a_eliminar = e.currentTarget.getAttribute("data-id");
        eliminarProductoDetalle(id_a_eliminar);
      });
    });

    // Evento de poblar los inputs de producto al hacer click en la fila
    document.querySelectorAll("#detalleVentaBody tr").forEach((row) => {
      row.addEventListener("click", () => {
        const id_producto = row.id.replace("row-", "");
        const productoSeleccionado = productos.find(
          (p) => p.id_producto === id_producto
        );
        if (productoSeleccionado) {
          document.getElementById("productoId").value =
            productoSeleccionado.id_producto;
          document.getElementById("productoSelect").value =
            productoSeleccionado.id_producto;
          document.getElementById("productoCantidad").value =
            productoSeleccionado.cantidad;
          document.getElementById("productoPrecio").value =
            productoSeleccionado.precio_unitario.toFixed(2);
        }
      });
    });
  }

  document.getElementById("subtotalVenta").textContent = `S/.${subtotal.toFixed(
    2
  )}`;
  return subtotal;
}

// Funciones de actualización
function actualizarProducto() {
  const id = document.getElementById("productoId").value.trim();
  const selectProducto = document.getElementById("productoSelect");

  // Si el 'select' está vacío, no habrá 'selectedIndex', lo que puede causar un error
  if (selectProducto.selectedIndex === -1 || selectProducto.value === "") {
    mostrarAlerta(
      "warning",
      "Advertencia",
      "Por favor, selecciona un producto."
    );
    return;
  }

  // Obtener el nombre del producto seleccionado
  const nombre =
    selectProducto.options[selectProducto.selectedIndex].textContent;

  const cantidad = parseInt(document.getElementById("productoCantidad").value);
  const precioUnitario = parseFloat(
    document.getElementById("productoPrecio").value
  );

  // Validación
  if (
    !id ||
    isNaN(cantidad) ||
    cantidad <= 0 ||
    isNaN(precioUnitario) ||
    precioUnitario < 0
  ) {
    mostrarAlerta(
      "warning",
      "Advertencia",
      "Por favor, completa la cantidad y el precio unitario correctamente."
    );
    return;
  }

  // encontrar el producto en el array (trabajando con la referencia productosVentaActual)
  const productoExistente = productosVentaActual.find(
    (p) => p.id_producto === id
  );
  const precioTotal = cantidad * precioUnitario;

  if (productoExistente) {
    // A. MODIFICAR EL PRODUCTO EXISTENTE (se modifica directamente en el array referenciado)
    productoExistente.cantidad = cantidad;
    productoExistente.precio_unitario = precioUnitario; // Guardar el precio unitario para futuras actualizaciones
    productoExistente.precio_total = precioTotal;
    mostrarAlerta("info", "Actualizado", `Cantidad de ${nombre} actualizada.`);
  } else {
    // B. AÑADIR NUEVO PRODUCTO
    productosVentaActual.push({
      id_producto: id,
      nombre: nombre,
      cantidad: cantidad,
      precio_unitario: precioUnitario,
      precio_total: precioTotal,
    });
    mostrarAlerta("success", "Añadido", `${nombre} agregado a la venta.`);
  }

  // C. CALCULAR Y ACTUALIZAR SUBTOTAL EN EL OBJETO VENTA POR ACTUALIZAR
  // Esto asegura que el subtotal del objeto guardado sea correcto
  const nuevoSubtotal = productosVentaActual.reduce(
    (acc, p) => acc + p.precio_total,
    0
  );
  ventaPorActualizar.subtotal = nuevoSubtotal;

  // D. ¡CLAVE! GUARDAR LA VENTA ACTUALIZADA EN LOCALSTORAGE
  guardarDatos("ventaPorActualizar", ventaPorActualizar);

  // Limpia el formulario de producto
  document.getElementById("productoSelect").value = "";
  document.getElementById("productoId").value = "";
  document.getElementById("productoCantidad").value = 1;
  document.getElementById("productoPrecio").value = "";
  document.getElementById("productoCantidad").removeAttribute("max");

  // Renderizamos el array actualizado
  renderDetalleVenta(ventaPorActualizar);
}

function actualizarVenta(event) {
  //construir el objeto venta
  event.preventDefault();

  // 1. Recolección de datos (AHORA LEYENDO DE SELECTS)
  const subtotal = renderDetalleVenta(ventaPorActualizar);

  const cliente = {
    nombre: document.getElementById("clienteNombre").value.trim(),
    dni: document.getElementById("clienteDNI").value.trim(),
    direccion: document.getElementById("clienteDireccion").value.trim(),
    distrito: document.getElementById("clienteDistrito").value.trim(),
    provincia: document.getElementById("clienteProvincia").value.trim(),
  };

  const ventaData = {
    canal_venta: document.getElementById("canalVenta").value, // Lee del SELECT
    tipo_venta: document.getElementById("tipoVenta").value, // Lee del SELECT
    medio_pago: document.getElementById("medioPago").value, // Lee del SELECT
    tipo_entrega: document.getElementById("tipoEntrega").value, // Lee del SELECT
    comentario: document.getElementById("comentario").value.trim(),
    fecha_venta: new Date().toISOString().slice(0, 10),
    estado: "Registrada",
    subtotal: subtotal,
  };

  // Si algún select de venta no fue seleccionado (aunque tienen 'required'):
  if (Object.values(ventaData).some((val) => val === "")) {
    mostrarAlerta(
      "warning",
      "Advertencia",
      "Por favor, completa todos los campos de Datos de Venta y Cliente."
    );
    return;
  }

  // cargamos las app_sales
  // 3. Cargar las ventas existentes
  const ventasExistentes = cargarDatos(SALES_KEY); // SALES_KEY es 'app_sales'

  // 4. Construir el objeto de la venta actualizada
  const ventaActualizada = {
    id_venta: ventaPorActualizar.id_venta, // Mantenemos el ID original
    ...ventaData,
    cliente: cliente,
    productos: productosVentaActual, // Los productos ya están actualizados
  };

  // 5. ENCONTRAR EL ÍNDICE POR ID (LA CORRECCIÓN CLAVE)
  const indice = ventasExistentes.findIndex(
    (v) => v.id_venta === ventaActualizada.id_venta
  );

  console.log("Indice", indice)

  // 6. Reemplazar el elemento si se encuentra
  if (indice !== -1) {
    // Reemplazamos el objeto antiguo con el nuevo objeto actualizado
    ventasExistentes[indice] = ventaActualizada;

    // 7. Guardar el array completo de app_sales en localStorage
    guardarDatos(SALES_KEY, ventasExistentes);

    mostrarAlerta(
      "success",
      "Venta Actualizada",
      `La Venta ${ventaActualizada.id_venta} ha sido guardada.`
    );

//     // setTimeout(() => {
//     //   // Redirigir o recargar después de un pequeño retraso
//     //   window.location.href = "lista-ventas.html"; // Redirige a la lista
//     // }, 1500);
  }
}
