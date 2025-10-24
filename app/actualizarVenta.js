import {
  cargarDatos,
  eliminarDatos,
  guardarDatos,
  logout,
  mostrarAlerta,
  navegarA,
  // 💡 Importación de funciones reutilizables de utils.js
  llenarDatosVenta, 
  llenarDatosCliente, 
  renderDetalleVenta
} from "./utils.js";

//comprobamos si estamos loggeados
if(cargarDatos('userLogged').length === 0){
  navegarA("/index.html");
} else if (cargarDatos('ventaSeleccionada').length === 0){
  navegarA("/pages/lista-ventas.html")
}


const SALES_KEY = "app_sales";

// Cargar y guardar la venta seleccionada para trabajar con ella
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
  // Rellenar los selects
  inicializarSelectsVenta();
  // Rellenar inventario
  cargarInventarioCSV();
  
  // 💡 Llenar datos de venta y cliente usando las funciones de utils.js
  llenarDatosVenta(ventaPorActualizar);
  llenarDatosCliente(ventaPorActualizar);
  
  // 💡 Renderizar tabla de productos, usando la función específica
  renderDetalleVentaActualizar(); 

  // Evento del boton Actualizar Producto
  document
    .getElementById("btnActualizarProducto")
    .addEventListener("click", actualizarProducto);

  // Evento de actualizar Venta (al enviar el formulario)
  document
    .getElementById("ventaForm")
    .addEventListener("submit", actualizarVenta);
    
  document.getElementById('btnRegresar').addEventListener('click', () => navegarA('/pages/detalle-venta.html'))
  document.getElementById('btnLogout').addEventListener('click', () => logout())
});


// ===================================================================
// Lógica de Carga de Datos y UI (CÓDIGO EXISTENTE)
// ===================================================================

function inicializarSelectsVenta() {
  // Rellenar selects de Datos de Venta (canal, tipo, pago, entrega)
  const canalVentaSelect = document.getElementById("canalVenta");
  const tipoVentaSelect = document.getElementById("tipoVenta");
  const medioPagoSelect = document.getElementById("medioPago");
  const tipoEntregaSelect = document.getElementById("tipoEntrega");

  OPCIONES_VENTA.canalVenta.forEach((opcion) => {
    const option = document.createElement("option");
    option.value = opcion;
    option.textContent = opcion;
    canalVentaSelect.appendChild(option);
  });

  OPCIONES_VENTA.tipoVenta.forEach((opcion) => {
    const option = document.createElement("option");
    option.value = opcion;
    option.textContent = opcion;
    tipoVentaSelect.appendChild(option);
  });

  OPCIONES_VENTA.medioPago.forEach((opcion) => {
    const option = document.createElement("option");
    option.value = opcion;
    option.textContent = opcion;
    medioPagoSelect.appendChild(option);
  });

  OPCIONES_VENTA.tipoEntrega.forEach((opcion) => {
    const option = document.createElement("option");
    option.value = opcion;
    option.textContent = opcion;
    tipoEntregaSelect.appendChild(option);
  });
}

function cargarInventarioCSV() {
  fetch(INVENTORY_PATH)
    .then((response) => response.text())
    .then((csvText) => {
      // Uso de PapaParse para parsear el CSV
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        complete: function (results) {
          inventarioProductos = results.data;
          poblarSelectProductos(inventarioProductos);
        },
      });
    })
    .catch((error) => {
      console.error("Error al cargar el inventario CSV:", error);
      mostrarAlerta(
        "error",
        "Error",
        "No se pudo cargar el inventario de productos."
      );
    });
}

function poblarSelectProductos(productos) {
  const selectProductos = document.getElementById("productoSelect");
  selectProductos.innerHTML = '<option value="">Seleccione un producto</option>'; // Opción por defecto

  productos.forEach((producto) => {
    const option = document.createElement("option");
    option.value = producto.id_producto;
    option.textContent = `${producto.nombre}`;
    selectProductos.appendChild(option);
  });
  
  selectProductos.addEventListener("change", poblarDatosProducto);
}

function poblarDatosProducto() {
  const productoId = document.getElementById("productoSelect").value;
  const productoCantidadInput = document.getElementById("productoCantidad");
  const productoPrecioInput = document.getElementById("productoPrecio");
  const productoIdInput = document.getElementById("productoId");

  // Limpiar campos si no se selecciona nada
  if (!productoId) {
    productoPrecioInput.value = "";
    productoCantidadInput.value = 1;
    productoCantidadInput.removeAttribute("max");
    productoIdInput.value = "";
    return;
  }

  const producto = inventarioProductos.find(
    (p) => p.id_producto === productoId
  );

  if (producto) {
    productoPrecioInput.value = producto.precio_unitario.toFixed(2);
    productoCantidadInput.setAttribute("max", producto.stock); // Establecer max basado en el stock
    productoIdInput.value = producto.id_producto; // Guardar el ID
  }
}


// ===================================================================
// Lógica de Renderizado de Detalle de Venta (REFACTORIZADO)
// ===================================================================

/**
 * Función específica para renderizar la tabla de productos de actualización.
 * Define los handlers para los clics en filas y en botones de eliminar,
 * y actualiza el subtotal en el objeto de ventaPorActualizar.
 */
function renderDetalleVentaActualizar() {
    
    // 1. Definir el Handler para el clic en la fila: Rellenar el formulario de edición
    const handleRowClick = (id_producto) => {
        const productoSeleccionado = productosVentaActual.find(
          (p) => p.id_producto === id_producto
        );
        if (productoSeleccionado) {
            // Llenar el formulario de modificación de producto
            document.getElementById("productoId").value = productoSeleccionado.id_producto;
            document.getElementById("productoSelect").value = productoSeleccionado.id_producto;
            document.getElementById("productoCantidad").value = productoSeleccionado.cantidad;
            document.getElementById("productoPrecio").value = productoSeleccionado.precio_unitario.toFixed(2);
        }
    };
    
    // 2. 💡 Reutilizar renderDetalleVenta de utils.js
    const subtotal = renderDetalleVenta(
        productosVentaActual, 
        true, // mostrarAcciones: Sí (botón eliminar)
        eliminarProductoDetalle, // eliminarHandler: La función local de eliminación
        handleRowClick // rowClickHandler: La función local para llenar el formulario
    );
    
    // 3. Actualizar el estado local con el nuevo subtotal
    ventaPorActualizar.subtotal = subtotal;
    // Persistir el objeto de venta actualizado (con el subtotal) en localStorage temporalmente
    guardarDatos("ventaPorActualizar", ventaPorActualizar);

    return subtotal;
}

// FUNCIÓN DE ELIMINACIÓN DE PRODUCTO EN EL DETALLE
function eliminarProductoDetalle(id_producto) {
    productosVentaActual = productosVentaActual.filter(p => p.id_producto !== id_producto);
    renderDetalleVentaActualizar(); // Re-renderiza y actualiza el estado
    mostrarAlerta('success', 'Eliminado!','El producto ha sido quitado del detalle de venta.');
}


// ===================================================================
// Lógica de Actualización de Producto y Venta (CÓDIGO MODIFICADO)
// ===================================================================

function actualizarProducto() {
  const productoId = document.getElementById("productoId").value;
  const nombreProducto = document.getElementById("productoSelect").options[document.getElementById("productoSelect").selectedIndex].text.split(" (Stock:")[0];
  let cantidad = parseInt(document.getElementById("productoCantidad").value);
  let precioUnitario = parseFloat(document.getElementById("productoPrecio").value);

  // Validación básica
  if (!productoId || isNaN(cantidad) || cantidad <= 0 || isNaN(precioUnitario) || precioUnitario <= 0) {
    mostrarAlerta("error", "Error", "Completa todos los campos de producto con valores válidos.");
    return;
  }
  
  // Validar stock (usando el máximo establecido por poblarDatosProducto)
  const maxStock = parseInt(document.getElementById("productoCantidad").getAttribute("max"));
  if (cantidad > maxStock) {
    mostrarAlerta("warning", "Advertencia", `La cantidad supera el stock disponible (${maxStock} unidades).`);
    return;
  }

  const productoExistente = productosVentaActual.find(
    (p) => p.id_producto === productoId
  );
  
  const nuevoProducto = {
    id_producto: productoId,
    nombre: nombreProducto,
    cantidad: cantidad,
    precio_unitario: precioUnitario,
    precio_total: cantidad * precioUnitario,
  };

  if (productoExistente) {
    // Modificar producto existente
    Object.assign(productoExistente, nuevoProducto);
    mostrarAlerta("info", "Actualizado", `Cantidad de ${nombreProducto} actualizada.`);
  } else {
    // Añadir nuevo producto
    productosVentaActual.push(nuevoProducto);

    mostrarAlerta("success", "Añadido", `${nombreProducto} agregado a la venta.`);
  }

  // C. CALCULAR Y ACTUALIZAR SUBTOTAL, RENDERIZADO Y GUARDADO EN UNA SOLA LLAMADA:
  renderDetalleVentaActualizar();

  // Limpia el formulario de producto
  document.getElementById("productoSelect").value = "";
  document.getElementById("productoId").value = "";
  document.getElementById("productoCantidad").value = 1;
  document.getElementById("productoPrecio").value = "";
  document.getElementById("productoCantidad").removeAttribute("max");
}

function actualizarVenta(event) {
  event.preventDefault();

  // 1. Recolección de datos
  const subtotal = ventaPorActualizar.subtotal; // 💡 Usamos el subtotal ya calculado y guardado

  const cliente = {
    nombre: document.getElementById("clienteNombre").value.trim(),
    dni: document.getElementById("clienteDNI").value.trim(),
    direccion: document.getElementById("clienteDireccion").value.trim(),
    distrito: document.getElementById("clienteDistrito").value.trim(),
    provincia: document.getElementById("clienteProvincia").value.trim(),
  };

  const ventaData = {
    canal_venta: document.getElementById("canalVenta").value,
    tipo_venta: document.getElementById("tipoVenta").value,
    medio_pago: document.getElementById("medioPago").value,
    tipo_entrega: document.getElementById("tipoEntrega").value,
    comentario: document.getElementById("comentario").value.trim(),
    fecha_venta: ventaPorActualizar.fecha_venta, // Mantenemos la fecha original
    estado: "Registrado",
    subtotal: subtotal,
  };

  // 2. Validación de formularios
  if (productosVentaActual.length === 0) {
    mostrarAlerta("error", "Error", "La venta debe contener al menos un producto.");
    return;
  }

  // Validación de campos principales de venta/cliente
  if (Object.values(ventaData).some((val) => val === "") || Object.values(cliente).some((val) => val === "")) {
    mostrarAlerta(
      "warning",
      "Advertencia",
      "Por favor, completa todos los campos de Datos de Venta y Cliente."
    );
    return;
  }

  // 3. Cargar las ventas existentes
  const ventasExistentes = cargarDatos(SALES_KEY); 

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
    guardarDatos('ventaSeleccionada',ventaActualizada)
    // Eliminar la clave temporal de trabajo
    eliminarDatos("ventaPorActualizar"); 

    mostrarAlerta(
      "success",
      "¡Venta Actualizada!",`
      La venta ${ventaActualizada.id_venta} ha sido modificada exitosamente.`
    );
    
    setTimeout(() => {
        navegarA('/pages/detalle-venta.html'); // Volver al detalle para ver los cambios
    }, 1500);

  } else {
    mostrarAlerta(
        "error",
        "Error",
        "No se pudo encontrar la venta original para actualizar."
      );
  }
}