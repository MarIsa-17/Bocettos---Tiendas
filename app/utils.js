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