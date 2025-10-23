export function cargarUsuarios (){
    const usuarios = localStorage.getItem('usuarios')
    return usuarios ? JSON.parse(usuarios) : []
}

// Cargar datos desde el local storage
export function cargarDatos(key) {
    const dataJSON = localStorage.getItem(key);
    return dataJSON ? JSON.parse(dataJSON) : [];
}

// eliminar un elemento del localStorage
export function eliminarDatos(key) {
    localStorage.removeItem(key);
}


// Guardar un arreglo en el localStorage
export function guardarDatos(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Generar un ID único para una nueva venta
export function generarIdVenta(ventas) {
    const count = ventas.length + 1;
    // Formatea el número a 4 dígitos con ceros iniciales
    return 'V-' + count.toString().padStart(4, '0');
}


// personalizar alertas
 export function mostrarAlerta(icono, titulo, mensaje) {
  Swal.fire({
    icon: icono,
    title: titulo,
    text: mensaje,
    confirmButtonText: 'OK',
    confirmButtonColor: '#4A4A4A',
    customClass: {
      confirmButton:
        'text-white font-semibold rounded hover:bg-white hover:text-[#4A4A4A] transition duration-200'
    },
    background: '#ffffff', 
    color: '#4A4A4A', 
  })
}

//funcion de navegacion
export function navegarA(ruta){
    window.location.href = ruta
}

export function logout(){
    eliminarDatos('userLogged');
    window.location.href = "../index.html"
}

/**
 * Rellena los campos de datos de venta (canal, tipo, pago, entrega, comentario)
 * con los valores de un objeto de venta.
 * @param {Object} venta - El objeto de venta.
 */
export function llenarDatosVenta(venta) {
    document.getElementById("canalVenta").value = venta.canal_venta || '';
    document.getElementById("tipoVenta").value = venta.tipo_venta || '';
    document.getElementById("medioPago").value = venta.medio_pago || '';
    document.getElementById("tipoEntrega").value = venta.tipo_entrega || '';
    document.getElementById("comentario").value = venta.comentario || '';
}

/**
 * Rellena los campos de datos del cliente.
 * @param {Object} venta - El objeto de venta con la propiedad 'cliente'.
 */
export function llenarDatosCliente(venta) {
    if (!venta || !venta.cliente) return;
    document.getElementById("clienteNombre").value = venta.cliente.nombre || '';
    document.getElementById("clienteDNI").value = venta.cliente.dni || '';
    document.getElementById("clienteDireccion").value = venta.cliente.direccion || '';
    document.getElementById("clienteDistrito").value = venta.cliente.distrito || '';
    document.getElementById("clienteProvincia").value = venta.cliente.provincia || '';
}

/**
 * Renderiza la tabla de productos del detalle de venta.
 * @param {Array<Object>} productos - El array de productos de la venta.
 * @param {boolean} mostrarAcciones - Si debe mostrar la columna de botones (e.g., eliminar).
 * @param {Function} [eliminarHandler] - Función a llamar al hacer clic en eliminar (solo si mostrarAcciones es true).
 * @param {Function} [rowClickHandler] - Función a llamar al hacer clic en una fila.
 * @returns {number} El subtotal calculado.
 */
export function renderDetalleVenta(productos, mostrarAcciones = false, eliminarHandler = null, rowClickHandler = null) {
    const tbody = document.getElementById("detalleVentaBody");
    const subtotalDisplay = document.getElementById("subtotalVenta");

    if (!tbody || !subtotalDisplay) return 0;

    tbody.innerHTML = "";
    let subtotal = 0;
    const colspan = mostrarAcciones ? 5 : 4;

    if (!productos || productos.length === 0) {
        const emptyRow = `<tr><td colspan="${colspan}" class="px-4 py-3 text-center text-gray-500">Aún no hay productos en la venta.</td></tr>`;
        tbody.innerHTML = emptyRow;
    } else {
        productos.forEach((producto) => {
            subtotal += producto.precio_total;
            const precioTotalFormatted = producto.precio_total ? producto.precio_total.toFixed(2) : '0.00';
            const precioUnitarioFormatted = producto.precio_unitario ? producto.precio_unitario.toFixed(2) : '0.00';
            
            // Usamos 'producto.id_producto' como un identificador único para la fila
            const rowId = `row-${producto.id_producto}`; 
            
            const accionesCol = mostrarAcciones 
                ? `<td class="px-4 py-3 text-center">
                    <button type="button" 
                            data-id="${producto.id_producto}" 
                            class="btn-eliminar-producto text-red-500 hover:text-red-700 font-bold p-1 rounded transition duration-150">
                        🗑️
                    </button>
                  </td>`
                : `<td class="px-4 py-3 border-r border-gray-200 text-sm text-right">S/. ${precioUnitarioFormatted}</td>`;
            
            const row = `
                <tr id="${rowId}" class="${rowClickHandler ? 'cursor-pointer hover:bg-gray-100 transition duration-150' : ''}">
                    <td class="px-4 py-3 border-r border-gray-200 text-sm">${producto.id_producto}</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm">${producto.nombre}</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm text-center">${producto.cantidad}</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm text-right">S/. ${precioTotalFormatted}</td>
                    ${accionesCol}
                </tr>
            `;
            tbody.insertAdjacentHTML("beforeend", row);
        });

        // Asignar eventos de eliminación
        if (mostrarAcciones && eliminarHandler) {
            document.querySelectorAll(".btn-eliminar-producto").forEach((button) => {
                button.addEventListener("click", (e) => {
                    const id_a_eliminar = e.currentTarget.getAttribute("data-id");
                    // Llama al handler del archivo principal para manejar el array
                    eliminarHandler(id_a_eliminar); 
                });
            });
        }
        
        // Asignar eventos de click de fila
        if (rowClickHandler) {
             document.querySelectorAll("#detalleVentaBody tr").forEach((row) => {
                // Evitamos asignar el evento a la fila vacía
                if (row.id.startsWith('row-')) { 
                    row.addEventListener("click", () => {
                        const id_producto = row.id.replace("row-", "");
                        rowClickHandler(id_producto);
                    });
                }
            });
        }
    }

    subtotalDisplay.textContent = `S/.${subtotal.toFixed(2)}`;
    return subtotal;
}

// funciones de descarga de csv
/**
 * 💡 Función que transforma un array de objetos JSON, que pueden tener 
 * propiedades anidadas (como 'cliente' y 'productos'), a una cadena de texto CSV.
 * Asume que el objetivo es tener una fila por producto vendido.
 * @param {Array<Object>} data - El array de objetos de venta.
 * @returns {string} La cadena de texto en formato CSV.
 */
export function jsonToCsv(data) {
    if (!data || data.length === 0) return '';

    // 1. Obtener y normalizar las cabeceras
    const headerSet = new Set();
    const normalizedData = [];

    data.forEach(venta => {
        // Campos de Venta (primer nivel, excepto 'cliente' y 'productos')
        const ventaKeys = Object.keys(venta).filter(k => k !== 'cliente' && k !== 'productos');

        // Normalizar los campos de venta para cada producto
        venta.productos.forEach(producto => {
            const row = {};

            // 1. Agregar campos de la venta principal
            ventaKeys.forEach(key => {
                row[key] = venta[key];
                headerSet.add(key);
            });

            // 2. Agregar campos del cliente (aplanados)
            Object.keys(venta.cliente).forEach(key => {
                const newKey = `cliente_${key}`; // Ej: cliente_nombre
                row[newKey] = venta.cliente[key];
                headerSet.add(newKey);
            });

            // 3. Agregar campos del producto (aplanados)
            Object.keys(producto).forEach(key => {
                const newKey = `producto_${key}`; // Ej: producto_nombre
                row[newKey] = producto[key];
                headerSet.add(newKey);
            });

            normalizedData.push(row);
        });
    });

    const headers = Array.from(headerSet);

    // 2. Construir la cadena CSV
    // Cabecera:
    let csv = headers.join(',') + '\n';

    // Filas:
    normalizedData.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Asegurar que comas y saltos de línea dentro del valor sean escapados con comillas dobles
            const stringValue = (value === undefined || value === null) ? '' : String(value);
            const needsQuotes = stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n');
            
            if (needsQuotes) {
                 // Escapar comillas dobles con otra comilla doble, y luego envolver en comillas
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        });
        csv += values.join(',') + '\n';
    });

    return csv;
}

/**
 * 💡 Función para crear y simular la descarga de un archivo CSV.
 * @param {string} csvString - La cadena de texto en formato CSV.
 * @param {string} filename - El nombre del archivo a descargar.
 */
export function downloadCsv(csvString) {
    // Crear un Blob (Binary Large Object) para el archivo CSV.
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);
    
    return url;
}