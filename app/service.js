//Lógica para traer datos de cliente segun DNI o RUC
//token: sk_11206.K37BUnb8Hy9OJWeFS6eMDMZTyGZawJLw
export async function fetchDatosCliente(documento) {
    // La clave (token) de la API
    const token = 'sk_11206.K37BUnb8Hy9OJWeFS6eMDMZTyGZawJLw';
    let url = '';

    // DNI: https://api.decolecta.com/v1/reniec/dni?numero=46027897
    if(documento.length === 8){
        url = `https://api.decolecta.com/v1/reniec/dni?numero=${documento}`;
    }

    // RUC: https://api.decolecta.com/v1/sunat/ruc?numero=20601030013
    if(documento.length === 11){
        url = `https://api.decolecta.com/v1/sunat/ruc?numero=${documento}`;
    }

    if (!url) {
        console.error('El número de documento no es un DNI (8 dígitos) ni un RUC (11 dígitos).');
        return null;
    }

    // --- INICIO DE LA IMPLEMENTACIÓN DEL CORS PROXY ---
    // Usamos corsproxy.io para evitar el error CORS en desarrollo local.
    // NOTA: Esto no es recomendable para producción.
    const CORS_PROXY_URL = 'https://corsproxy.io/?';
    // Codificamos la URL de la API antes de pasarla al proxy.
    const targetUrl = encodeURIComponent(url);
    const finalUrl = `${CORS_PROXY_URL}${targetUrl}`;
    // --- FIN DE LA IMPLEMENTACIÓN DEL CORS PROXY ---

    try {
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                // Se agrega el token de la API en el encabezado Authorization
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });

        // Verifica si la solicitud fue exitosa (código de estado 200-299)
        if (!response.ok) {
            // Lanza un error si la respuesta no es OK, por ejemplo 404 o 500
            throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data; // Retorna los datos del cliente (DNI o RUC)
    } catch (error) {
        console.error('Error al realizar la búsqueda de cliente:', error);
        // Podrías mostrar una alerta al usuario aquí si lo deseas
        return null;
    }
}