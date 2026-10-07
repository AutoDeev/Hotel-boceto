# AURIA Hotel Boutique

Sitio web en HTML, CSS y JavaScript vanilla. Abre `index.html` o ejecuta `python3 -m http.server 8765` y visita `http://localhost:8765/`.

## Sitio público

Diseño en marfil, terracota, azul suave y ciruela. Incluye filtros de habitaciones, favoritos persistentes, fichas de habitación, experiencias con pestañas, galería filtrable con navegación por teclado, testimonios, preguntas desplegables y formulario de contacto conectado a la bandeja de mensajes del panel.

El sitio no incluye un sistema de reservas.

## Acceso personal

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Empleado | `empleado` | `empleado123` |

El administrador gestiona habitaciones, empleados, mensajes y configuración. El empleado consulta habitaciones y clientes, y puede leer y clasificar mensajes. Empleados y configuración están restringidos al administrador.

Los datos se guardan en `localStorage` y la sesión en `sessionStorage`. La autenticación es simulada y los mensajes se guardan únicamente en este navegador. Las imágenes y fuentes necesitan conexión a Internet. No hay backend ni envío real de correos.
