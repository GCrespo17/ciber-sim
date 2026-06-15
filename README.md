# ciber-sim

Simulación académica de ataque informático y remediación sobre un portal académico de calificaciones.

Este cambio es solo el **bootstrap técnico inicial**. La funcionalidad del portal académico se implementará en cambios posteriores.

## Stack Tecnológico

- **Runtime:** Node.js 20 LTS
- **Backend:** Express + TypeScript
- **Base de datos:** PostgreSQL 16
- **Frontend:** HTML, CSS y JavaScript vanilla (sin frameworks)
- **Entorno de desarrollo:** Docker Compose

## Estructura del Repositorio

```
backend/       — Código fuente del backend (TypeScript/Express)
frontend/      — Archivos estáticos del frontend SPA
db/            — Scripts de inicialización de base de datos
docs/          — Documentación académica del proyecto
```

Las versiones **vulnerable** y **asegurada** se gestionarán mediante ramas Git (por ejemplo, `version-vulnerable` y `version-asegurada`) una vez que el portal académico esté implementado.

## Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (incluido con Docker Desktop)
- Opcional: Node.js 20 LTS y npm para flujos de trabajo sin contenedores

## Inicio Rápido

1. Copia el archivo de ejemplo de variables de entorno y ajústalo si es necesario:

   ```bash
   cp .env.example .env
   ```

2. Inicia el stack de desarrollo:

   ```bash
   docker compose up --build
   ```

3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Variables de Entorno

Las variables de entorno se configuran mediante un archivo `.env` (copiado de `.env.example`). Las principales son:

| Variable          | Descripción                    | Valor por defecto |
|-------------------|--------------------------------|-------------------|
| `PORT`            | Puerto del servidor Express    | `3000`            |
| `POSTGRES_DB`     | Nombre de la base de datos     | `ciber_sim`       |
| `POSTGRES_USER`   | Usuario de PostgreSQL          | `devuser`         |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL     | `devpassword`     |
| `POSTGRES_HOST`   | Host de PostgreSQL             | `localhost`       |
| `POSTGRES_PORT`   | Puerto de PostgreSQL           | `5432`            |
| `DATABASE_URL`    | URL de conexión a PostgreSQL   | —                 |

## Notas

- Docker Compose está configurado para el desarrollo del equipo. La guía completa para ejecución en VMs y configuración de redes de laboratorio se refinará en cambios posteriores.
- ⚠️ **Importante:** Las versiones vulnerables que se crearán en el futuro son exclusivamente para uso en laboratorios aislados con fines educativos. No deben desplegarse en entornos de producción ni exponerse a redes no controladas.

## Funcionalidades no implementadas aún

Este bootstrap **no incluye** intencionalmente:

- Autenticación ni sesiones de usuario
- Roles (estudiante, profesor, administrador)
- Gestión de calificaciones
- Vulnerabilidades intencionales
- Lógica de remediación
- Datos semilla reales

Estas funcionalidades se desarrollarán en cambios posteriores sobre ramas específicas.
