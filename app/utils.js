export function cargarUsuarios (){
    const usuarios = localStorage.getItem('usuarios')
    return usuarios ? JSON.parse(usuarios) : []
}