# PRD: Portal de Calificaciones para Simulacion de Ciberseguridad

## 1. Proposito

Crear un portal academico de calificaciones que permita demostrar, en una primera fase vulnerable, una cadena de ataque reproducible basada en filtracion de errores tecnicos e IDOR, y luego documentar una fase segura donde los mismos flujos queden remediados.

El producto debe ser suficientemente funcional para una demostracion academica, pero mantener el alcance controlado: primero se construye la version insegura, luego la version segura y finalmente las evidencias de laboratorio.

## 2. Alcance Del Producto

### Incluido

- Portal web con login, panel de estudiante y panel de profesor.
- Backend Express con API REST en ingles y PostgreSQL.
- Datos semilla pequenos pero suficientes para la demo.
- Modelo academico con usuarios, cursos, secciones, inscripciones y calificaciones.
- Version vulnerable con autenticacion minima, filtracion de errores tecnicos e IDOR por cambio manual de ID.
- CRUD tecnico para entidades principales, documentado como HU de sistema/equipo tecnico.
- Tabla separada de remediacion con controles de seguridad esperados.
- Evidencias minimas para reproducir ataque, validar remediacion y ejecutar en entorno local/VM.

### Fuera De Alcance

- Recuperacion de contrasena.
- Emails o notificaciones.
- Carga masiva de datos.
- Reportes avanzados.
- Calculo automatico de promedios o notas finales.
- Auditoria avanzada.
- Rate limiting.
- UI administrativa.
- Despliegue cloud.

## 3. Fases De Entrega

### Fase 1: Version Vulnerable

Construir el portal funcional con vulnerabilidades deliberadas y acotadas para la simulacion academica.

Debe permitir:

- Login con credenciales semilla.
- Sesion simple por cookie.
- Logout.
- Consulta de perfil y calificaciones del estudiante.
- Panel de profesor con secciones asignadas, estudiantes inscritos y edicion/registro de calificaciones.
- CRUD tecnico por API para usuarios, cursos, secciones, inscripciones y calificaciones.
- Ataque principal: error leak + IDOR.

### Fase 2: Version Segura

Remediar la misma funcionalidad sin redisenar el producto.

Debe permitir:

- Repetir los mismos flujos funcionales.
- Repetir los mismos pasos de ataque y comprobar que fallan.
- Retornar errores genericos al cliente.
- Aplicar autorizacion server-side por rol y propiedad del recurso.
- Validar IDs antes de consultar la base de datos.
- Usar consultas parametrizadas en los puntos vulnerables.
- Endurecer cookies de sesion con flags basicos.

### Fase 3: Evidencias Finales

Preparar los artefactos minimos de evaluacion academica.

Debe incluir:

- Inventario de endpoints.
- Datos semilla y credenciales de demo.
- Pasos de ejecucion local con Docker Compose.
- Pasos de demo final en VMs locales.
- Pasos del ataque error leak + IDOR.
- Evidencia esperada del ataque vulnerable.
- Evidencia esperada de la remediacion.
- Mapeo breve a OWASP y MITRE ATT&CK.

## 4. Actores De HU

Las historias de usuario funcionales se limitan a:

- Estudiante.
- Profesor.
- Sistema/equipo tecnico, solo para CRUD tecnico y datos de soporte.

Red Team, Blue Team y evaluador/docente no se modelan como actores de HU. Sus necesidades se cubren mediante requisitos tecnicos, tabla de remediacion y evidencias.

## 5. Modelo De Datos

El dominio se nombra tecnicamente en ingles.

Entidades principales:

- `users`: estudiantes y profesores.
- `sessions`: sesiones simples por cookie.
- `courses`: catalogo de cursos o materias.
- `sections`: instancia de un curso para un semestre, asignada a un profesor.
- `enrollments`: relacion entre estudiante y seccion.
- `grades`: calificaciones asociadas a una inscripcion.

### Campos Minimos

`users`:

- `id`
- `name`
- `email` o `username`
- `password`
- `role`: `student` o `teacher`

`sessions`:

- `id`
- `user_id`
- `token`
- `created_at`

`courses`:

- `id`
- `code`
- `name`

`sections`:

- `id`
- `course_id`
- `teacher_id`
- `semester`
- `name` o `group_code`

`enrollments`:

- `id`
- `student_id`
- `section_id`

`grades`:

- `id`
- `enrollment_id`
- `evaluation_type`
- `score`
- `weight`
- `period`
- `observation`

### Reglas De Calificacion

- La escala de nota es de `0.0` a `20.0`.
- Se acepta un decimal.
- No se calcula promedio automatico en el MVP.
- El sistema muestra calificaciones individuales por semestre y curso/seccion.

## 6. Autenticacion Y Sesion

### Version Vulnerable

- Login con usuario/contrasena de datos semilla.
- Contrasenas en texto plano para simplificar la demo vulnerable.
- Comparacion directa contra la base de datos.
- Cookie de sesion simple.
- Logout funcional.
- Estas debilidades se documentan como deuda de seguridad secundaria, no como ataque principal.

### Version Segura

- Mantiene el mismo flujo de login/logout.
- Valida sesion en backend.
- Aplica flags basicos de cookie.
- Evita exponer detalles de sesion o errores internos al cliente.

## 7. API REST

La API usa recursos plurales en ingles.

Endpoints funcionales minimos:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/users/:id/profile`
- `GET /api/users/:id/grades`
- `GET /api/sections`
- `GET /api/sections/:id/students`
- `POST /api/grades`
- `PUT /api/grades/:id`

Endpoints CRUD tecnicos esperados:

- `/api/users`
- `/api/courses`
- `/api/sections`
- `/api/enrollments`
- `/api/grades`

Para CRUD tecnico:

- Crear, listar y actualizar son obligatorios.
- Eliminar es opcional o limitado cuando las relaciones puedan romper datos semilla o dificultar la demo.

## 8. Pantallas

### Login

Permite iniciar sesion con credenciales semilla.

Despues del login, el backend devuelve el usuario autenticado con su `role`. El frontend muestra el panel correspondiente.

### Panel De Estudiante

Muestra:

- Perfil basico.
- Calificaciones propias.
- Agrupacion por semestre y curso/seccion.
- Profesor, tipo de evaluacion, nota, porcentaje, periodo y observacion.
- Logout.

### Panel De Profesor

Muestra:

- Secciones asignadas al profesor.
- Estudiantes inscritos en cada seccion.
- Calificaciones de esos estudiantes.
- Acciones para registrar y editar calificaciones.
- Logout.

No se incluye UI administrativa para CRUD tecnico.

## 9. Vulnerabilidad Principal

La version vulnerable debe demostrar una cadena compuesta por:

1. Manejo inseguro de errores.
2. Broken Access Control / IDOR.

### Error Leak

Endpoint principal:

- `GET /api/users/:id/grades`

Payload principal:

- `GET /api/users/abc/grades`

Comportamiento vulnerable esperado:

- El endpoint construye la consulta SQL por concatenacion de forma deliberada y acotada.
- El ID no numerico provoca error de base de datos o del servidor.
- La respuesta devuelve JSON tecnico completo.

El JSON vulnerable puede incluir:

- Mensaje tecnico de PostgreSQL o del servidor.
- Contexto o fragmento de consulta.
- Stack trace.

### IDOR

Endpoint principal:

- `GET /api/users/:id/grades`

Comportamiento vulnerable esperado:

- El atacante inicia sesion como estudiante semilla.
- El atacante cambia manualmente `:id` por el ID de otro estudiante.
- El backend verifica como maximo que exista una sesion.
- El backend no valida que el usuario autenticado sea propietario de las calificaciones solicitadas.
- La API devuelve calificaciones de otro estudiante.

El IDOR se concentra en consultas por ID. La escritura indebida de notas fuera de seccion no es el foco principal del ataque.

## 10. Historias De Usuario

### HU-01: Login De Usuario

Como estudiante o profesor, quiero iniciar sesion con mis credenciales, para acceder al panel que corresponde a mi rol.

Criterios de aceptacion:

- Given un usuario semilla existente, when ingresa credenciales validas, then el sistema crea una sesion y muestra su panel segun `role`.
- Given credenciales invalidas, when intenta iniciar sesion, then el sistema rechaza el acceso.
- Given un usuario autenticado, when cierra sesion, then la sesion deja de ser utilizable.

### HU-02: Consulta De Perfil Del Estudiante

Como estudiante, quiero ver mi perfil basico, para confirmar que estoy autenticado con la cuenta correcta.

Criterios de aceptacion:

- Given un estudiante autenticado, when abre su panel, then ve su nombre, identificador y rol.
- Given una sesion inexistente, when intenta consultar el perfil, then el sistema no muestra el panel.

Nota vulnerable:

- En la version vulnerable, la API de perfil por ID puede carecer de autorizacion completa si se consulta manualmente.

### HU-03: Consulta De Calificaciones Del Estudiante

Como estudiante, quiero consultar mis calificaciones por semestre y curso, para revisar mi desempeno academico.

Criterios de aceptacion:

- Given un estudiante autenticado con inscripciones, when abre el panel, then ve sus calificaciones agrupadas por semestre y curso/seccion.
- Given una calificacion, when se muestra, then incluye tipo de evaluacion, nota, porcentaje, periodo y observacion si existe.
- Given una nota, when se muestra, then usa escala de `0.0` a `20.0` con un decimal.

Nota vulnerable:

- En la version vulnerable, el endpoint `GET /api/users/:id/grades` permite consultar calificaciones de otro estudiante mediante cambio manual de ID.

### HU-04: Consulta De Secciones Del Profesor

Como profesor, quiero ver mis secciones asignadas, para identificar los grupos en los que debo gestionar calificaciones.

Criterios de aceptacion:

- Given un profesor autenticado, when abre su panel, then ve las secciones que tiene asignadas.
- Given una seccion, when se muestra, then incluye curso, semestre y grupo/codigo.
- Given un estudiante autenticado, when abre su panel, then no ve el panel de profesor.

### HU-05: Consulta De Estudiantes Por Seccion

Como profesor, quiero ver los estudiantes inscritos en mis secciones, para registrar o editar sus calificaciones.

Criterios de aceptacion:

- Given un profesor autenticado, when selecciona una seccion asignada, then ve los estudiantes inscritos.
- Given un estudiante inscrito, when se muestra, then se identifica con nombre e identificador.
- Given una seccion sin estudiantes, when se selecciona, then se muestra un estado vacio comprensible.

### HU-06: Registro De Calificacion

Como profesor, quiero registrar calificaciones de estudiantes inscritos en mis secciones, para mantener actualizado el desempeno academico.

Criterios de aceptacion:

- Given un profesor autenticado y una seccion asignada, when registra una calificacion para un estudiante inscrito, then la calificacion queda disponible en el panel del estudiante.
- Given una nota fuera de escala, when intenta registrarla, then el sistema debe rechazarla en la version segura.
- Given una calificacion valida, when se registra, then contiene tipo de evaluacion, nota, porcentaje, periodo y observacion opcional.

Nota vulnerable:

- La version vulnerable puede tener validaciones insuficientes, siempre que no impidan la demo principal.

### HU-07: Edicion De Calificacion

Como profesor, quiero editar calificaciones registradas, para corregir errores academicos.

Criterios de aceptacion:

- Given una calificacion existente de una seccion asignada, when el profesor actualiza sus datos, then el cambio queda visible para el estudiante.
- Given campos modificables, when se edita, then se pueden actualizar nota, porcentaje, tipo, periodo u observacion.
- Given una calificacion inexistente, when se intenta editar, then el sistema responde con error controlado en la version segura.

### HU-08: CRUD Tecnico De Usuarios

Como sistema/equipo tecnico, quiero crear, listar y actualizar usuarios, para preparar datos semilla y escenarios de prueba.

Criterios de aceptacion:

- Given datos validos de usuario, when se crea un usuario, then queda disponible para login o relacion academica segun su rol.
- Given usuarios existentes, when se listan, then se obtienen estudiantes y profesores.
- Given un usuario existente, when se actualiza, then sus datos quedan persistidos.
- Delete es opcional o limitado.

### HU-09: CRUD Tecnico De Cursos

Como sistema/equipo tecnico, quiero crear, listar y actualizar cursos, para configurar materias usadas por las secciones.

Criterios de aceptacion:

- Given datos validos de curso, when se crea, then puede asociarse a secciones.
- Given cursos existentes, when se listan, then se obtiene su codigo y nombre.
- Given un curso existente, when se actualiza, then el cambio queda persistido.
- Delete es opcional o limitado.

### HU-10: CRUD Tecnico De Secciones

Como sistema/equipo tecnico, quiero crear, listar y actualizar secciones, para asociar cursos, semestres y profesores.

Criterios de aceptacion:

- Given un curso y profesor existentes, when se crea una seccion, then queda disponible para inscripciones.
- Given secciones existentes, when se listan, then incluyen curso, profesor y semestre.
- Given una seccion existente, when se actualiza, then el cambio queda persistido.
- Delete es opcional o limitado.

### HU-11: CRUD Tecnico De Inscripciones

Como sistema/equipo tecnico, quiero crear, listar y actualizar inscripciones, para vincular estudiantes con secciones.

Criterios de aceptacion:

- Given un estudiante y una seccion existentes, when se crea una inscripcion, then el estudiante queda asociado a la seccion.
- Given inscripciones existentes, when se listan, then se identifica estudiante y seccion.
- Given una inscripcion existente, when se actualiza, then el cambio queda persistido.
- Delete es opcional o limitado.

### HU-12: CRUD Tecnico De Calificaciones

Como sistema/equipo tecnico, quiero crear, listar y actualizar calificaciones, para preparar y corregir datos academicos de demo.

Criterios de aceptacion:

- Given una inscripcion existente, when se crea una calificacion, then queda asociada al estudiante y seccion correctos.
- Given calificaciones existentes, when se listan, then se observan sus campos academicos principales.
- Given una calificacion existente, when se actualiza, then el cambio queda persistido.
- Delete es opcional o limitado.

## 11. Tabla De Remediacion

| Debilidad vulnerable | Riesgo | Control en version segura | Validacion esperada |
| --- | --- | --- | --- |
| Consulta de calificaciones por ID sin validar propiedad | Estudiante accede a calificaciones ajenas | Autorizacion server-side: estudiante solo accede a su propio recurso; profesor solo a sus secciones | El mismo cambio manual de ID devuelve `403` generico |
| ID no numerico llega a la consulta | Error tecnico expuesto y comportamiento no controlado | Validacion de parametros antes de DB | `/api/users/abc/grades` devuelve `400` generico |
| SQL construido por concatenacion en endpoint vulnerable | Error leak y posible ampliacion a inyeccion | Consulta parametrizada | El payload no altera SQL ni filtra consulta |
| Errores tecnicos devueltos al cliente | Fuga de stack trace, estructura DB o query | Handler centralizado con errores genericos y logging interno | Cliente no recibe stack trace ni mensajes internos |
| Cookie de sesion simple | Sesion debil para demo | Flags basicos de cookie y validacion de sesion | Cookie usa controles basicos y endpoints requieren sesion valida |
| Passwords en texto plano | Exposicion si se filtra la base de datos | Hash de contrasenas si se implementa endurecimiento de auth | La base no almacena passwords legibles |

## 12. Datos Semilla

El dataset debe ser pequeno pero suficiente:

- 2 profesores.
- 5 estudiantes.
- 3 cursos.
- 4 secciones.
- Inscripciones cruzadas entre estudiantes y secciones.
- Varias calificaciones por estudiante.
- Credenciales conocidas y documentadas para demo.

Los datos deben permitir:

- Login como estudiante atacante.
- Identificar otro estudiante victima.
- Login como profesor.
- Ver secciones asignadas al profesor.
- Registrar o editar calificaciones.
- Ejecutar IDOR cambiando manualmente IDs.

## 13. Entornos De Ejecucion

### Desarrollo Y Validacion Diaria

Entorno primario:

- Local con Docker Compose.
- Backend y PostgreSQL levantados desde el repositorio.

### Demostracion Academica Final

Entorno objetivo:

- VMs locales.
- VM victima con la aplicacion.
- VM atacante Kali en la misma red local/VirtualBox.

Se pueden documentar dos formas de ejecucion:

- Docker Compose como camino recomendado.
- Ejecucion manual con Node.js y PostgreSQL como alternativa si se requiere.

## 14. Validacion Manual

### Fase Vulnerable

La fase vulnerable se considera lista cuando se puede demostrar manualmente:

- La aplicacion levanta localmente.
- Un estudiante inicia sesion.
- Un profesor inicia sesion.
- El estudiante ve sus notas.
- El profesor ve sus secciones y estudiantes.
- El profesor registra o edita una calificacion.
- `GET /api/users/abc/grades` devuelve JSON tecnico completo.
- Un estudiante autenticado cambia manualmente `:id` y ve calificaciones de otro estudiante.

### Fase Segura

La fase segura se considera lista cuando:

- Los flujos funcionales anteriores siguen operando.
- `GET /api/users/abc/grades` devuelve error generico sin detalles internos.
- El cambio manual de ID devuelve `403` o equivalente generico.
- No se filtran calificaciones ajenas.
- El cliente no recibe stack trace ni fragmentos SQL.

## 15. Evidencias Academicas Minimas

El repositorio o la documentacion final debe incluir:

- Inventario de endpoints.
- Credenciales y datos semilla de demo.
- Pasos para levantar el stack local.
- Pasos para ejecutar en VMs locales.
- Payload de error leak: `/api/users/abc/grades`.
- Pasos de IDOR por cambio manual de ID.
- Resultado esperado vulnerable.
- Resultado esperado seguro.
- Mapeo breve a OWASP: Broken Access Control e inseguro manejo de errores.
- Mapeo breve a MITRE ATT&CK o Kill Chain segun el formato requerido por el curso.

## 16. Decisiones Cerradas

- El PRD cubre el proyecto completo, pero la implementacion inicia por la fase vulnerable.
- Las HU funcionales solo usan Estudiante y Profesor.
- CRUD tecnico se expresa como HU de sistema/equipo tecnico.
- La API y base de datos usan nombres tecnicos en ingles.
- El frontend usa vanilla HTML/CSS/JS.
- El backend usa Express, TypeScript y PostgreSQL.
- La cadena de ataque principal es error leak + IDOR.
- La escritura indebida no es el foco del ataque.
- La validacion del PRD es manual funcional.
- No se incluyen pruebas automatizadas como requisito de cierre del PRD.

## 17. Decisiones Pendientes

- Definir nombres exactos de usuarios, cursos y credenciales semilla.
- Definir nombres tecnicos finales de ramas: `vulnerable` y `secured` o equivalentes en espanol.
- Definir si el endurecimiento de passwords con hash entra en la fase segura obligatoria o queda como mejora secundaria.
