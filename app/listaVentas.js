import { cargarDatos, guardarDatos } from "./utils.js";

const OPCIONES_VENTA = {
    canalVenta: ['Web', 'Tienda Física', 'Instagram', 'Facebook', 'WhatsApp'],
    // tipoVenta: ['Venta Directa', 'Cotización', 'Venta a Crédito'],
    // medioPago: ['Efectivo', 'Tarjeta de Crédito', 'Transferencia', 'Yape/Plin'],
    tipoEntrega: ['Recojo en Tienda', 'Envío local', 'Envío nacional'],
    estadoVenta: ['Registrada', 'Completada', 'Cancelada']
};

const SALES_KEY = 'app_sales'; 
const ventasIniciales = cargarDatos(SALES_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // Inicialización de Selects
    inicializarSelectsVenta();

    // Renderización de lista de ventas
    renderizarListaVentas(ventasIniciales);

    // Eventos de filtro
    // Evento al seleccionar fecha
    document.getElementById('fechaVenta').addEventListener('change', filtrarPorFecha);

    // Evento al seleccionar tipo de entrega
    document.getElementById('tipoEntrega').addEventListener('change', filtrarPorTipoEntrega);

    // Evento al seleccionar canal de venta
    document.getElementById('canalVenta').addEventListener('change', filtrarPorCanalVenta);

    // Evento al seleccionar estado de venta
    document.getElementById('estadoVenta').addEventListener('change', filtrarPorEstadoVenta);

    // Evento para eliminar todos los filtros
    document.getElementById('botonLimpiarFiltros').addEventListener('click', limpiarFiltros);

    // Evento al hacer clic en "Agregar Venta"
    document.getElementById('botonAgregarVenta').addEventListener('click', mostrarAgregarVenta);

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

function renderizarListaVentas(ventas){

    // capturar el body de la tabla
    const tablaVentasBody = document.getElementById('tablaVentasBody');

    // Limpiar las filas menos el header
    tablaVentasBody.innerHTML = '';

//     {
//   "id_venta": "V-0001", sí
//   "canal_venta": "WhatsApp", sí
//   "tipo_venta": "Tipo1", en detalle
//   "medio_pago": "Tarjeta", sí
//   "tipo_entrega": "Recojo", sí
//   "comentario": "Nada relevante", en detalle
//   "fecha_venta": "2025-10-20", sí
//   "estado": "Registrada", sí
//   "subtotal": 144, en detalle
//   "cliente": {
//     "nombre": "Samuel",
//     "dni": "78859865", sí
//     "direccion": "Av El Rio 456",
//     "distrito": "Pueblo Libre",
//     "provincia": "Lima"
//   },
//   "productos": [ //detalle
//     {
//       "id_producto": "52",
//       "nombre": "Bitacora",
//       "cantidad": 3,
//       "precio_unitario": 48,
//       "precio_total": 144
//     }
//   ]
// }

    // Construir las filas
    ventas.forEach(venta => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-2 py-3 border-r border-gray-200">${venta.id_venta}</td>
            <td class="px-2 py-3 border-r border-gray-200">${venta.cliente.dni}</td>
            <td class="px-2 py-3 border-r border-gray-200">S/.${venta.subtotal}</td>
            <td class="px-2 py-3 border-r border-gray-200">${venta.medio_pago}</td>
            <td class="px-2 py-3 border-r border-gray-200">${venta.tipo_entrega}</td>
            <td class="px-2 py-3 border-r border-gray-200">${venta.canal_venta}</td>
            <td class="px-2 py-3 border-r border-gray-200">${venta.estado}</td>
            <td class="px-2 py-3 border-r border-gray-200">${venta.fecha_venta}</td>
            <td class="px-2 py-1 text-center ">
                <div class="flex justify-center">
                    <button id="botonMostrarVenta" class="bg-[#4A4A4A] text-white font-normal px-2 rounded transition duration-200 ease-in-out border border-transparent hover:bg-white hover:text-[#4A4A4A] hover:border-[#4A4A4A]">
                        Mostrar
                    </button>
                </div>
            </td>
        `;
        //agregarle evento al boton mostrar
        const botonMostrar = row.querySelector('#botonMostrarVenta');
        botonMostrar.addEventListener('click', () => {
            mostrarDetallesVenta(venta);
        });
        tablaVentasBody.appendChild(row);
    });
}

//Eventos de filtrado
function filtrarPorFecha(event){
    // Modificamos el array ventas para que solo tenga las ventas de la fecha seleccionada
    const fechaSeleccionada = event.target.value;
    // convertimos la fecha a string
    // const fechaString = new Date(fechaSeleccionada).toISOString().split('T')[0];
    const ventasFiltradas = ventasIniciales.filter(venta => {
        return venta.fecha_venta === fechaSeleccionada;
    });


    // Renderizamos la tabla con las ventas filtradas
    renderizarListaVentas(ventasFiltradas);
}

function filtrarPorTipoEntrega(event){
    const tipoEntregaSeleccionado = event.target.value;
    console.log('Tipo de entrega seleccionado:', tipoEntregaSeleccionado);
    const ventasFiltradas = ventasIniciales.filter(venta => {
        return venta.tipo_entrega === tipoEntregaSeleccionado;
    });

    // Renderizamos la tabla con las ventas filtradas
    renderizarListaVentas(ventasFiltradas);
}

function filtrarPorCanalVenta(event){
    const canalVentaSeleccionado = event.target.value;
    console.log('Canal de venta seleccionado:', canalVentaSeleccionado);
    const ventasFiltradas = ventasIniciales.filter(venta => {
        return venta.canal_venta === canalVentaSeleccionado;
    });

    // Renderizamos la tabla con las ventas filtradas
    renderizarListaVentas(ventasFiltradas);
}

function filtrarPorEstadoVenta(event){
    const estadoVentaSeleccionado = event.target.value;
    console.log('Estado de venta seleccionado:', estadoVentaSeleccionado);
    const ventasFiltradas = ventasIniciales.filter(venta => {
        return venta.estado === estadoVentaSeleccionado;
    });

    // Renderizamos la tabla con las ventas filtradas
    renderizarListaVentas(ventasFiltradas);
}

function limpiarFiltros(){
    // Reiniciar los selects y el input de fecha
    document.getElementById('fechaVenta').value = '';
    document.getElementById('tipoEntrega').value = '';
    document.getElementById('canalVenta').value = '';
    document.getElementById('estadoVenta').value = '';
    // Renderizar la lista completa de ventas
    renderizarListaVentas(ventasIniciales);
}

// Funciones de navegación y detalles
function mostrarDetallesVenta(venta) {
    // Guardar la venta seleccionada en el localStorage
    guardarDatos('ventaSeleccionada', venta);
    // Redirigir a la página de detalles de venta
    window.location.href = 'detalle-venta.html';
}

function mostrarAgregarVenta(){
    window.location.href = 'registro-venta.html';
}