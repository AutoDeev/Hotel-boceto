# AURIA Hotel Boutique

Demo web de hotel construida con HTML, CSS y JavaScript vanilla. Abre `index.html` en un navegador para recorrer la landing y realizar reservas de prueba. Las imágenes y fuentes se cargan desde servicios externos; el resto de la demo no necesita conexión ni servidor.

## Acceso al panel

Desde **Acceso personal** en la landing o abriendo `login.html`:

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Empleado | `empleado` | `empleado123` |

El administrador gestiona reservas, habitaciones, empleados y configuración. El empleado consulta el panel, reservas, habitaciones y clientes, y puede actualizar reservas. Las secciones exclusivas del administrador muestran **Acceso restringido**.

La autenticación es simulada. La sesión se conserva en `sessionStorage` y los datos de demostración en `localStorage` de ese navegador. No hay pagos, envío real de correos ni backend.

## Archivos

- `index.html`: sitio público y reservas.
- `login.html`: acceso de demostración.
- `dashboard.html`: panel de gestión.
- `css/`: estilos compartidos, de la landing y del panel.
- `js/`: datos, autenticación e interacciones.

Para mostrar la demo con una URL local también puedes ejecutar `python3 -m http.server 8765` en este directorio y abrir `http://localhost:8765/`.
