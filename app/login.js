import { cargarUsuarios, mostrarAlerta } from "./utils.js"

const formulario = document.getElementById('formularioLogin')
console.log(formulario)
console.log(cargarUsuarios)

formulario.addEventListener('submit', manejarLogin)

function manejarLogin(event) {
    event.preventDefault()
    
    const loginUsuario = document.getElementById('usuario').value.trim()
    const loginPassword = document.getElementById('password').value
    
    const usuarios = cargarUsuarios(); // Reutiliza la función cargarUsuarios
    
    // Busca el usuario que coincida con nombre Y contraseña
    const usuarioEncontrado = usuarios.find(user => 
        user.usuario === loginUsuario && user.password === loginPassword
    );
    console.log(usuarioEncontrado)
    if (usuarioEncontrado) {
        mostrarAlerta('success', 'Bienvenido', `Hola, ${usuarioEncontrado.usuario}!`)
        setTimeout(() => {
            window.location.href= "/pages/lista-ventas.html"
            },3000);

    } else {
        mostrarAlerta('error', 'Error', 'Usuario o contraseña incorrectos.')
    }
}
