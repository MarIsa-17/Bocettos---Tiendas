import { cargarDatos, eliminarDatos, guardarDatos } from "./utils.js";

let venta = cargarDatos("ventaSeleccionada");

const OPCIONES_VENTA = {
    canalVenta: ['Web', 'Tienda Física', 'Instagram', 'Facebook', 'WhatsApp'],
    tipoVenta: ['Venta Directa', 'Cotización', 'Venta a Crédito'],
    medioPago: ['Efectivo', 'Tarjeta de Crédito', 'Transferencia', 'Yape/Plin'],
    tipoEntrega: ['Recojo en Tienda', 'Envío local', 'Envío nacional']
};

const INVENTORY_PATH = '/csvs/inventario.csv';
// Variable para el inventario cargado del CSV
let inventarioProductos = [];

document.addEventListener("DOMContentLoaded", () => {
  //Rellenar los selects
    inicializarSelectsVenta();
    // Rellenar inventario
    cargarInventarioCSV();
  // llenar datos de venta
    llenarDatosVenta();
  // llenar datos de cliente
    llenarDatosCliente();
  // renderizar tabla de productos
    renderDetalleVenta();

    // evento: cuando se seleccione una fila, se rellena los campos de producto
});

function cargarInventarioCSV() {
    Papa.parse(INVENTORY_PATH, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.data.length === 0 || results.errors.length > 0) {
                Swal.fire('Error de Carga', 'No se pudo cargar el inventario de productos desde el CSV.', 'error');
                return;
            }
            inventarioProductos = results.data;
            poblarSelectProductos();
        },
        error: function(error) {
            Swal.fire('Error de Carga', `Error al acceder al CSV: ${error.message}. Asegúrate de usar Live Server.`, 'error');
        }
    });
}

function poblarSelectProductos() {
    const select = document.getElementById('productoSelect');
    select.innerHTML = '<option value="" disabled selected>Selecciona un producto</option>';

    const productosDisponibles = inventarioProductos.filter(p => p.disponible === "TRUE");

    productosDisponibles.forEach(producto => {
        const optionElement = document.createElement('option');
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
            select.innerHTML = '<option value="" disabled selected>Selecciona una opción</option>';
            
            OPCIONES_VENTA[key].forEach(opcion => {
                const optionElement = document.createElement('option');
                optionElement.value = opcion;
                optionElement.textContent = opcion;
                select.appendChild(optionElement);
            });
        }
    }
}

function llenarDatosVenta() {
    console.log(venta);
  document.getElementById("canalVenta").value = venta.canal_venta;
  document.getElementById("tipoVenta").value = venta.tipo_venta;
  document.getElementById("medioPago").value = venta.medio_pago;
  document.getElementById("tipoEntrega").value = venta.tipo_entrega;
  document.getElementById("comentario").value = venta.comentario;
}

function llenarDatosCliente() {
  document.getElementById("clienteNombre").value = venta.cliente.nombre;
  document.getElementById("clienteDNI").value = venta.cliente.dni;
  document.getElementById("clienteDireccion").value = venta.cliente.direccion;
  document.getElementById("clienteDistrito").value = venta.cliente.distrito;
  document.getElementById("clienteProvincia").value = venta.cliente.provincia;
}

function renderDetalleVenta() {
    const tbody = document.getElementById('detalleVentaBody');
    tbody.innerHTML = ''; 
    let subtotal = 0;

    let productos = venta.productos

    if (productos.length === 0) {
        // La fila de vacío ahora debe usar colspan="5"
        const emptyRow = `<tr><td colspan="5" class="px-4 py-3 text-center text-gray-500">Aún no hay productos en la venta.</td></tr>`;
        tbody.innerHTML = emptyRow;
    } else {
        productos.forEach(producto => {
            subtotal += producto.precio_total;
            // Template de la fila incluyendo la nueva columna y el botón
            const row = `
                <tr id="row-${producto.id_producto}">
                    <td class="px-4 py-3 border-r border-gray-200 text-sm">${producto.id_producto}</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm">${producto.nombre}</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm text-center">${producto.cantidad}</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm text-right">S/. ${producto.precio_total.toFixed(2)}</td>
                    <td class="px-4 py-3 text-center">
                        <button type="button" 
                                data-id="${producto.id_producto}" 
                                class="btn-eliminar-producto text-red-500 hover:text-red-700 font-bold p-1 rounded transition duration-150">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
            tbody.insertAdjacentHTML('beforeend', row);
        });
        
        // Asignar eventos a los botones después de que las filas son insertadas en el DOM
        document.querySelectorAll('.btn-eliminar-producto').forEach(button => {
            button.addEventListener('click', (e) => {
                const id_a_eliminar = e.currentTarget.getAttribute('data-id');
                eliminarProductoDetalle(id_a_eliminar);
            });
        });

        // Evento de poblar los inputs de producto al hacer click en la fila
        document.querySelectorAll('#detalleVentaBody tr').forEach(row => {
            row.addEventListener('click', () => {
                const id_producto = row.id.replace('row-', '');
                const productoSeleccionado = productos.find(p => p.id_producto === id_producto);
                if (productoSeleccionado) {
                    document.getElementById('productoId').value = productoSeleccionado.id_producto;
                    document.getElementById('productoSelect').value = productoSeleccionado.id_producto;
                    document.getElementById('productoCantidad').value = productoSeleccionado.cantidad;
                    document.getElementById('productoPrecio').value = productoSeleccionado.precio_unitario.toFixed(2);
                }
            });
        });
    }

    document.getElementById('subtotalVenta').textContent = `$${subtotal.toFixed(2)}`;
    return subtotal;
}
