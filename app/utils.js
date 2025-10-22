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