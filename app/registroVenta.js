import { cargarDatos, guardarDatos, renderDetalleVenta, generarIdVenta, mostrarAlerta, navegarA, logout } from "./utils.js";

if(cargarDatos('userLogged').length === 0){
  navegarA('../index.html')
}

// Datos de los selects de venta
const OPCIONES_VENTA = {
    canalVenta: ['Web', 'Tienda Física', 'Instagram', 'Facebook', 'WhatsApp'],
    tipoVenta: ['Venta Directa', 'Cotización', 'Venta a Crédito'],
    medioPago: ['Efectivo', 'Tarjeta de Crédito', 'Transferencia', 'Yape/Plin'],
    tipoEntrega: ['Recojo en Tienda', 'Envío local', 'Envío nacional']
};

// Variable para el inventario cargado del CSV
let inventarioProductos = [];
// Array temporal para guardar los productos añadidos a la venta actual
let productosVentaActual = [];

// Constantes a usar
const SALES_KEY = 'app_sales'; 
const INVENTORY_PATH = '../csvs/inventario.csv';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializar Selects de Datos de Venta
    inicializarSelectsVenta();
    
    // 2. Cargar Inventario desde CSV
    cargarInventarioCSV();

    // 3. Asignar Eventos
    document.getElementById('btnAgregarProducto').addEventListener('click', agregarProducto);
    document.getElementById('productoSelect').addEventListener('change', poblarDatosProducto);
    document.getElementById('ventaForm').addEventListener('submit', handleRegistrarVenta);
    document.getElementById('btnRegresar').addEventListener('click', () => navegarA('./lista-ventas.html'))
    document.getElementById('btnLogout').addEventListener('click', () => logout())

    renderDetalleVenta(productosVentaActual, true, eliminarProductoDetalle);

});


// ===================================================================
// Lógica para la inicialización de Selects y Carga de Inventario
// ===================================================================

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

function cargarInventarioCSV() {
    Papa.parse(INVENTORY_PATH, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.data.length === 0 || results.errors.length > 0) {
                mostrarAlerta('error','Error de Carga', 'No se pudo cargar el inventario de productos desde el CSV.')
                return;
            }
            inventarioProductos = results.data;
            poblarSelectProductos();
        },
        error: function(error) {
            mostrarAlerta('error','Error de Carga', `Error al acceder al CSV: ${error.message}. Asegúrate de usar Live Server.`)
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

function poblarDatosProducto() {
    const selectedId = document.getElementById('productoSelect').value;
    const producto = inventarioProductos.find(p => p.id_producto === selectedId);
    
    if (producto) {
        // Poblamos los campos dependientes
        document.getElementById('productoId').value = producto.id_producto;
        document.getElementById('productoPrecio').value = parseFloat(producto.precio).toFixed(2);
        document.getElementById('productoCantidad').max = parseInt(producto.disponible);
    }
}

// ===================================================================
// Lógica para el Detalle de Venta (Agregar Producto)
// ===================================================================

function agregarProducto() {
    const id = document.getElementById('productoId').value.trim();
    const selectProducto = document.getElementById('productoSelect');
    const nombre = selectProducto.options[selectProducto.selectedIndex].textContent.split('(')[0].trim(); // Obtener el nombre del select
    const cantidad = parseInt(document.getElementById('productoCantidad').value);
    const precioUnitario = parseFloat(document.getElementById('productoPrecio').value);

    // Validación
    if (!id || isNaN(cantidad) || cantidad <= 0 || isNaN(precioUnitario) || precioUnitario < 0) {
        mostrarAlerta('warning', 'Advertencia', 'Por favor, selecciona un producto y completa la cantidad.');
        return;
    }

    const productoExistente = productosVentaActual.find(p => p.id_producto === id);
    const precioTotal = cantidad * precioUnitario;

    if (productoExistente) {
        productoExistente.cantidad += cantidad;
        productoExistente.precio_total += precioTotal;
        mostrarAlerta('info', 'Actualizado', `Cantidad de ${nombre} actualizada.`);
    } else {
        productosVentaActual.push({
            id_producto: id,
            nombre: nombre,
            cantidad: cantidad,
            precio_unitario: precioUnitario,
            precio_total: precioTotal
        });
        mostrarAlerta('success', 'Añadido', `${nombre} agregado a la venta.`);
    }

    // Limpia el formulario de producto
    document.getElementById('productoSelect').value = "";
    document.getElementById('productoId').value = '';
    document.getElementById('productoCantidad').value = 1;
    document.getElementById('productoPrecio').value = '';
    document.getElementById('productoCantidad').removeAttribute('max');

    // Renderizamos el array actualizado
    renderDetalleVenta(productosVentaActual, true, eliminarProductoDetalle);
}

// Lógica para eliminar un producto del detalle de venta

function eliminarProductoDetalle(id_producto) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción eliminará el producto de la venta actual.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#4A4A4A',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Filtra el array, manteniendo solo los elementos cuyo ID no coincide con el producto a eliminar
            productosVentaActual = productosVentaActual.filter(p => p.id_producto !== id_producto);
            
            // Renderiza la tabla de nuevo
            renderDetalleVenta(productosVentaActual, true, eliminarProductoDetalle); 
            
            mostrarAlerta('success', 'Eliminado!','El producto ha sido quitado del detalle de venta.');
        }
    });
}

// ===================================================================
// Lógica para el Registro de Venta (HU 1)
// ===================================================================

function handleRegistrarVenta(event) {
    event.preventDefault(); 

    if (productosVentaActual.length === 0) {
        mostrarAlerta('error', 'Error', 'Debes agregar al menos un producto para registrar la venta.');
        return;
    }

    // 1. Recolección de datos (AHORA LEYENDO DE SELECTS)
    const subtotal = productosVentaActual.reduce((acc, p) => acc + p.precio_total, 0)

    const cliente = {
        nombre: document.getElementById('clienteNombre').value.trim(),
        dni: document.getElementById('clienteDNI').value.trim(),
        direccion: document.getElementById('clienteDireccion').value.trim(),
        distrito: document.getElementById('clienteDistrito').value.trim(),
        provincia: document.getElementById('clienteProvincia').value.trim()
    };
    
    const ventaData = {
        canal_venta: document.getElementById('canalVenta').value, // Lee del SELECT
        tipo_venta: document.getElementById('tipoVenta').value,     // Lee del SELECT
        medio_pago: document.getElementById('medioPago').value,     // Lee del SELECT
        tipo_entrega: document.getElementById('tipoEntrega').value, // Lee del SELECT
        comentario: document.getElementById('comentario').value.trim(),
        fecha_venta: new Date().toISOString().slice(0, 10), 
        estado: 'Registrada', 
        subtotal: subtotal 
    };
    
    // Si algún select de venta no fue seleccionado (aunque tienen 'required'):
    if (Object.values(ventaData).some(val => val === "")) {
        mostrarAlerta('warning', 'Advertencia', 'Por favor, completa todos los campos de Datos de Venta y Cliente.');
        return;
    }


    // 2. Construcción del objeto final
    const ventasExistentes = cargarDatos(SALES_KEY);
    const nuevaVenta = {
        id_venta: generarIdVenta(ventasExistentes),
        ...ventaData,
        cliente: cliente, 
        productos: productosVentaActual 
    };

    // 3. Persistencia
    ventasExistentes.push(nuevaVenta);
    guardarDatos(SALES_KEY, ventasExistentes);

    // 4. Limpieza y Feedback
    productosVentaActual = []; 
    renderDetalleVenta();
    document.getElementById('ventaForm').reset(); 

    Swal.fire({
        title: '¡Venta Registrada!',
        html: `La venta ha sido guardada exitosamente en LocalStorage.`,
        icon: 'success',
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

