import { cargarDatos, eliminarDatos, guardarDatos, mostrarAlerta, navegarA } from "./utils.js";

const venta = cargarDatos("ventaSeleccionada");

document.addEventListener("DOMContentLoaded", () => {
  // rellenar los datos de venta
  llenarDatosVenta();

  // rellenar los datos de cliente
  llenarDatosCliente();

  // rellenar la tabla de productos
  renderDetalleVenta();

  //añadir eventos al boton Actualizar
    document.getElementById("btnActualizarVenta").addEventListener("click", () => {
      actualizarVenta(venta);
    });

  //añadir evento al botón eliminar
  document.getElementById("btnEliminarVenta").addEventListener("click", () => {
    eliminarVenta(venta.id_venta);
  });

  document.getElementById('btnRegresar').addEventListener('click', () => navegarA('lista-ventas.html'))
});

// {
//   "id_venta": "V-0002",
//   "canal_venta": "Tienda Física",
//   "tipo_venta": "Venta Directa",
//   "medio_pago": "Yape/Plin",
//   "tipo_entrega": "Recojo en Tienda",
//   "comentario": "Comentario",
//   "fecha_venta": "2025-10-21",
//   "estado": "Registrada",
//   "subtotal": 93,
//   "cliente": {
//     "nombre": "Samuel",
//     "dni": "78859865",
//     "direccion": "Av El Rio 456",
//     "distrito": "Pueblo Libre",
//     "provincia": "Lima"
//   },
//   "productos": [
//     {
//       "id_producto": "P-001",
//       "nombre": "Bitácora A5 Tapa Dura",
//       "cantidad": 6,
//       "precio_unitario": 15.5,
//       "precio_total": 93
//     }
//   ]
// }

// Funciones de llenado de datos
function llenarDatosVenta() {
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
  const tbody = document.getElementById("detalleVentaBody");
  tbody.innerHTML = "";
  let subtotal = 0;
  const productosVentaActual = venta.productos;
  if (productosVentaActual.length === 0) {
    // La fila de vacío ahora debe usar colspan="5"
    const emptyRow = `<tr><td colspan="5" class="px-4 py-3 text-center text-gray-500">Aún no hay productos en la venta.</td></tr>`;
    tbody.innerHTML = emptyRow;
  } else {
    productosVentaActual.forEach((producto) => {
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
                    <td class="px-4 py-3 border-r border-gray-200 text-sm text-right">S/. ${producto.precio_unitario.toFixed(
                      2
                    )}</td>
                    <td class="px-4 py-3 border-r border-gray-200 text-sm text-right">S/. ${producto.precio_total.toFixed(
                      2
                    )}</td>
                </tr>
            `;
      tbody.insertAdjacentHTML("beforeend", row);
    });

    // Asignar eventos a los botones después de que las filas son insertadas en el DOM
    // document.querySelectorAll('.btn-eliminar-producto').forEach(button => {
    //     button.addEventListener('click', (e) => {
    //         const id_a_eliminar = e.currentTarget.getAttribute('data-id');
    //         eliminarProductoDetalle(id_a_eliminar);
    //     });
    // });
  }

  document.getElementById(
    "subtotalVenta"
  ).textContent = `S/. ${subtotal.toFixed(2)}`;
  return subtotal;
}

// Eventos de los botones Actualizar y Eliminar
function eliminarVenta(idVenta) {
  // Lógica para eliminar la venta
  // nos muestra un sweet alert para confirmar la eliminacion
  Swal.fire({
    title: "¿Estás seguro?",
    text: "Esta acción eliminará la venta actual por completo",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#4A4A4A",
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
  }).then((result) => {
    if (result.isConfirmed) {
      // eliminamos la venta de app_sales(localStorage)
      let ventas = cargarDatos("app_sales");
      ventas = ventas.filter((venta) => venta.id_venta !== idVenta);
        guardarDatos("app_sales", ventas);
        eliminarDatos("ventaSeleccionada");
      mostrarAlerta( "success", "Eliminado!", "La venta ha sido eliminada.");

      setTimeout(() => {
        //redirigir a la lista de ventas
        window.location.href = "lista-ventas.html";
      }, 2000);
    }
  });
}

function actualizarVenta(venta) {
  guardarDatos("ventaSeleccionada", venta);
  window.location.href = "actualizar-venta.html";
}
