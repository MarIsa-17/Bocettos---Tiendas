import { cargarUsuarios, mostrarAlerta } from "./utils.js"

const formulario = document.getElementById('formulario-registro')
formulario.addEventListener('submit', manejarRegistro)

function guardarUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
}

function manejarRegistro (event){
    event.preventDefault()
    const usuario = document.getElementById('usuario').value.trim()
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirmPassword').value

    if (password !== confirmPassword) {
        mostrarAlerta('error','Error', 'Las contraseñas no coinciden.')
        return;
    }
    const nuevoUsuario = {
        usuario: usuario,
        password: password,
        fechaRegistro: new Date().toISOString().slice(0,10)
    }

    let usuarios = cargarUsuarios()

    const usuarioExistente = usuarios.find(user => user.usuario === nuevoUsuario.usuario)

    if(usuarioExistente){
        mostrarAlerta('error','Error', `🚫 El usuario "${nuevoUsuario.usuario}" ya existe.`)
    } else {
        usuarios.push(nuevoUsuario)
        guardarUsuarios(usuarios)

        mostrarAlerta('success', '¡Registro Exitoso!', 'El usuario fue guardado correctamente(LocalStorage).')

        setTimeout(() => {
        window.location.href= "/index.html"
        },3000);
    }
    
}