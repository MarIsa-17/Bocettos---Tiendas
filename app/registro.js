import { cargarUsuarios, mostrarAlerta, navegarA } from "./utils.js";

const formulario = document.getElementById("formulario-registro");
formulario.addEventListener("submit", manejarRegistro);

function guardarUsuarios(usuarios) {
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

function manejarRegistro(event) {
  event.preventDefault();
  const usuario = document.getElementById("usuario").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    mostrarAlerta("error", "Error", "Las contraseñas no coinciden.");
    return;
  }

  // Formateamos a fecha peruana
  const fechaActual = new Date();

  // 🇵🇪 Zona Horaria de Lima, Perú (UTC-5)
  const opciones = {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  // Usamos 'en-CA' (Inglés de Canadá) porque su formato estándar es 'YYYY-MM-DD'
  const fechaPeru = fechaActual.toLocaleString("en-CA", opciones);

  const nuevoUsuario = {
    usuario: usuario,
    password: password,
    // fechaRegistro: new Date().toISOString().slice(0, 10),
    fechaRegistro: fechaPeru,
  };

  let usuarios = cargarUsuarios();

  const usuarioExistente = usuarios.find(
    (user) => user.usuario === nuevoUsuario.usuario
  );

  if (usuarioExistente) {
    mostrarAlerta(
      "error",
      "Error",
      `🚫 El usuario "${nuevoUsuario.usuario}" ya existe.`
    );
  } else {
    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    mostrarAlerta(
      "success",
      "¡Registro Exitoso!",
      "El usuario fue guardado correctamente(LocalStorage)."
    );

    setTimeout(() => {
      navegarA("/index.html");
    }, 3000);
  }
}
