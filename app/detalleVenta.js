import {
  cargarDatos,
  eliminarDatos,
  guardarDatos,
  mostrarAlerta,
  navegarA,
  logout,
  llenarDatosVenta,
  llenarDatosCliente,
  renderDetalleVenta
} from "./utils.js";

if(cargarDatos('userLogged').length === 0){
  navegarA("../index.html");
} else if (cargarDatos('ventaSeleccionada').length === 0){
  navegarA("./lista-ventas.html")
}


const venta = cargarDatos("ventaSeleccionada");

document.addEventListener("DOMContentLoaded", () => {
  // Rellenar datos de venta y cliente usando las funciones de utils
  llenarDatosVenta(venta);
  llenarDatosCliente(venta);

  // Rellenar la tabla de productos (sin acciones y sin handlers)
  // El renderizado ahora solo necesita el array de productos y el flag 'false'
  renderDetalleVenta(venta.productos, false);

  //añadir eventos al boton Actualizar
  document
    .getElementById("btnActualizarVenta")
    .addEventListener("click", () => {
      actualizarVenta(venta);
    });

  //añadir evento al botón eliminar
  document.getElementById("btnEliminarVenta").addEventListener("click", () => {
    eliminarVenta(venta.id_venta);
  });

  document
    .getElementById("btnRegresar")
    .addEventListener("click", () => navegarA("./lista-ventas.html"));

  document
    .getElementById("btnLogout")
    .addEventListener("click", () => logout());
});

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
      mostrarAlerta("success", "Eliminado!", "La venta ha sido eliminada.");

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
