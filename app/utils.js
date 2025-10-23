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