# ciber-sim: Proyecto Académico de Ciberseguridad (Red Team vs Blue Team)

Bienvenido al repositorio oficial de **ciber-sim**, una simulación estructurada de ataque informático y remediación técnica sobre un portal académico de gestión de calificaciones. 

 **AVISO IMPORTANTE DE NAVEGACIÓN:**
Esta rama (`main`) funciona exclusivamente como el **índice y la presentación técnica** del proyecto. El código fuente de la aplicación y las implementaciones de seguridad **no se encuentran aquí**. Para acceder el proyecto, por favor navegue hacia las ramas principales de desarrollo técnico que se detallan a continuación.

---

##  Estructura de Ramas (Branching Strategy)

El flujo de trabajo del repositorio refleja la división de labores entre el equipo ofensivo y defensivo, separados en dos entornos de código aislados:

*   🔴 **Rama `version-vulnerable` (Red Team):** Contiene la aplicación web (Node.js + PostgreSQL) programada intencionalmente sin *middlewares* de seguridad automatizada. Aquí reside el código donde se omitieron los controles lógicos para permitir la filtración de datos y la evasión de control de acceso. Esta rama documenta la superficie de ataque original.
*   🔵 **Rama `version-asegurada` (Blue Team):** Contiene la versión de la aplicación con las medidas correctivas implementadas de forma completamente manual. Aquí se puede auditar la lógica de mitigación programada (validación estricta de variables, validación de estado de sesión cruzado con el recurso y manejo de excepciones con *Try-Catch*).
*   *Ramas de características (Feature branches):* Se incluyen ramas secundarias utilizadas durante el desarrollo aislando vulnerabilidades específicas, tales como `vulnerable/user-login`, `seguro/perfil-idor`, entre otras.

---

##  Objetivo y Enfoque Técnico

A diferencia de los enfoques tradicionales que delegan la seguridad a librerías automatizadas, este proyecto adopta una metodología de programación de vulnerabilidades mediante lógica manual y *vulnerability chaining* (concatenación de vulnerabilidades).

El escenario práctico se centra en la explotación secuencial de dos riesgos críticos del OWASP Top 10:2025:
1.  **A10:2025 (Gestión Deficiente de Condiciones de Excepción):** Forzar el mal manejo de errores del servidor para extraer inteligencia técnica interna (rutas absolutas, *stack trace*, nombre de tablas en bases de datos) en las respuestas JSON enviadas al cliente.
2.  **A01:2025 (Ruptura de Control de Acceso - IDOR):** Utilizar la inteligencia filtrada para iterar identificadores y evadir la autorización *server-side*, logrando la suplantación y el robo de calificaciones de terceros sin los privilegios adecuados.

---

##  Arquitectura y Stack Tecnológico

La aplicación es un portal web de tres capas diseñado bajo los siguientes cimientos tecnológicos:

| Capa | Tecnología | Justificación de Diseño |
| :--- | :--- | :--- |
| **Frontend** | HTML, CSS, JavaScript (Vanilla) | Se evita el uso de frameworks (React/Angular) para garantizar la ausencia de sanitización automática del lado del cliente. Las peticiones se construyen con `fetch()` nativo. |
| **Backend** | Node.js (v20 LTS) + Express + TypeScript | Configurado como API REST sin *middlewares* de seguridad (Helmet, CORS). Maneja los parámetros de peticiones de manera cruda. |
| **Base de Datos** | PostgreSQL 16 | Almacena el esquema relacional de usuarios y calificaciones. Las consultas interactúan por concatenación directa, sin uso de ORM. |
| **Infraestructura** | Docker Compose / QEMU-KVM | El desarrollo se orquesta mediante contenedores, preparado para su despliegue en un entorno virtualizado aislado (Kali Linux y Ubuntu Server) bajo una red Host-Only para la auditoría ofensiva. |

---

##  Metodología Aplicada

El modelado de amenazas, la recolección de inteligencia y la ejecución del ataque se han mapeado estrictamente utilizando el marco de trabajo **MITRE ATT&CK®**. 

Las técnicas exploradas incluyen:
*   *Active Scanning: Vulnerability Scanning (T1595.002)* para la inyección de parámetros y recolección de errores.
*   *Application Layer Protocol: Web Protocols (T1071.001)* para el descubrimiento del motor de BD.
*   *Data from Information Repositories (T1213)* para la extracción masiva de identificadores numéricos en los *endpoints* vulnerables.

---

##  Organización del Equipo

El desarrollo, simulación y remediación fue ejecutado por los siguientes integrantes, divididos en roles operativos:

**🔴 Red Team (Análisis Ofensivo y Explotación):**
*   Kelvin Figueroa
*   Gabriel Crespo
*   Daniel Haro

**🔵 Blue Team (Arquitectura Defensiva y Mitigación):**
*   Bruno Yauripoma
*   Emmanuel Santiago
*   Jesus Romero

> **Instrucciones para iniciar la auditoría:** Por favor, seleccione la rama `version-vulnerable` en el menú desplegable superior izquierdo de GitHub para comenzar a revisar el *bootstrap* técnico y el código no asegurado.