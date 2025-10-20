const formulario = document.getElementById('formulario-registro')
formulario.addEventListener('submit', manejarRegistro)

function cargarUsuarios (){
    const usuarios = localStorage.getItem('usuarios')
    return usuarios ? JSON.parse(usuarios) : []
}

function guardarUsuarios(usuarios) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
}

function manejarRegistro (event){
    event.preventDefault()
    const usuario = document.getElementById('usuario').value.trim()
    const password = document.getElementById('password').value
    const confirmPassword = document.getElementById('confirmPassword').value

    if (password !== confirmPassword) {
        Swal.fire('Error', 'Las contraseñas no coinciden.', 'error')
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
        Swal.fire('Error', `🚫 El usuario "${nuevoUsuario.usuario}" ya existe.`,'error')
    } else {
        usuarios.push(nuevoUsuario)
        guardarUsuarios(usuarios)
        
        Swal.fire({
                title: '¡Registro Exitoso!',
                html: 'El usuario fue registrado y guardado localmente en tu navegador (LocalStorage).',
                icon: 'success'
        })
        setTimeout(() => {
        window.location.href= "/index.html"
        },3000);
    }
    
}