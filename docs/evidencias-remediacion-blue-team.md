# Evidencias de Remediación — Blue Team

**Proyecto:** Portal de Calificaciones — Simulación de Ciberseguridad
**Fase:** 3 — Evidencias finales (lado defensivo)
**Rama evaluada:** `version-asegurada`
**Equipo Blue Team:** Bruno, Emmanuel Santiago, Jesús

---

## 1. Propósito

Este documento contiene el **retest de la versión segura**: se repiten los mismos
ataques que el Red Team ejecuta contra la versión vulnerable y se demuestra que en
`version-asegurada` **fallan de forma controlada**, sin filtrar información ni
permitir acceso no autorizado.

Cada hallazgo se mapea a la Tabla de Remediación del PRD (sección 11) y al
OWASP Top 10:2025.

---

## 2. Entorno de prueba

La aplicación se levanta localmente con Docker Compose desde la raíz del repositorio:

```bash
# La versión segura cambia el seed (hashes), por eso se recrea el volumen con -v
docker compose down -v
docker compose up --build
```

| Componente | Valor |
| --- | --- |
| URL base | `http://localhost:3000` |
| Backend | Node.js + Express + TypeScript |
| Base de datos | PostgreSQL 16 (contenedor) |
| Puerto | 3000 |

---

## 3. Credenciales y datos semilla

Todos los usuarios semilla tienen la contraseña en claro `password123`
(almacenada como hash bcrypt en la base de datos).

| Email | Rol | ID | Uso en la demo |
| --- | --- | --- | --- |
| `student1@example.com` | student | 1 | Estudiante atacante |
| `student2@example.com` | student | 2 | Estudiante víctima (IDOR) |
| `teacher1@example.com` | teacher | 6 | Profesor (dueño de secciones 1 y 2) |
| `teacher2@example.com` | teacher | 7 | Profesor víctima (IDOR docente) |

> Nota de coordinación: el login es **por email**, no por username. El cuerpo de la
> petición es `{"email": "...", "password": "..."}`.

---

## 4. Inventario de endpoints

| Método | Endpoint | Descripción |
| --- | --- | --- |
| POST | `/api/auth/login` | Inicia sesión y crea cookie de sesión |
| POST | `/api/auth/logout` | Cierra la sesión |
| GET | `/api/users/:id/profile` | Perfil del usuario |
| GET | `/api/users/:id/grades` | Calificaciones del estudiante (endpoint del ataque) |
| GET | `/api/sections` | Secciones del profesor autenticado |
| GET | `/api/sections/:id/students` | Estudiantes de una sección |
| POST | `/api/grades` | Registrar calificación |
| PUT | `/api/grades/:id` | Editar calificación |

---

## 5. Retest A10:2025 — Mishandling of Exceptional Conditions

**Vector:** enviar un `:id` no numérico al endpoint de calificaciones.

**Payload:** `GET /api/users/abc/grades`

| | Versión vulnerable (esperado) | Versión segura (verificado) |
| --- | --- | --- |
| Código HTTP | 500 | **400** |
| Cuerpo | error de PostgreSQL + `query` + `stack` | `{"error":"Invalid user ID."}` |

Comando de retest:

```bash
curl -i -b cookies.txt http://localhost:3000/api/users/abc/grades
```

Resultado verificado en `version-asegurada`:

```txt
400 :: {"error":"Invalid user ID."}
```

**Controles aplicados:**
- Validación de entero antes de tocar la base de datos (`controllers/users.ts`).
- Consulta parametrizada con `$1` (`models/grade.ts`).
- Handler centralizado de errores que devuelve mensaje genérico (`index.ts`).

✅ No se filtra stack trace, fragmento SQL, nombre de tabla ni detalle de PostgreSQL.

---

## 6. Retest A01:2025 — Broken Access Control (IDOR estudiante)

**Vector:** estudiante autenticado cambia el `:id` por el de otro estudiante.

**Payload:** logueado como `student1` (id 1), solicitar `GET /api/users/2/grades`

| | Versión vulnerable (esperado) | Versión segura (verificado) |
| --- | --- | --- |
| Código HTTP | 200 | **403** |
| Cuerpo | calificaciones del estudiante 2 | `{"error":"Access denied."}` |

Resultados verificados en `version-asegurada`:

```txt
Login student1               -> 200 :: {"id":1,"name":"Ana García","role":"student"}
GET /api/users/1/grades      -> 200 (calificaciones propias)
GET /api/users/2/grades      -> 403 :: {"error":"Access denied."}
GET /api/users/abc/grades    -> 400 :: {"error":"Invalid user ID."}
Sin sesión                   -> 401 :: {"error":"Authentication required."}
```

**Control aplicado:** autorización server-side — se compara `sessionUser.id` con el
`:id` solicitado; el estudiante solo accede a su propio recurso (`controllers/users.ts`).

✅ El cambio manual de ID ya no devuelve datos ajenos.

---

## 7. Retest A01:2025 — Broken Access Control (IDOR docente)

Vulnerabilidad adicional detectada y remediada por el Blue Team: un profesor podía
ver/editar recursos de **otro** profesor.

**Escenario:** logueado como `teacher1` (dueño de secciones 1 y 2), intentar acceder
a recursos de `teacher2` (secciones 3 y 4).

Resultados verificados en `version-asegurada`:

```txt
Mis secciones                         -> 200 (solo secciones 1 y 2)
Estudiantes de sección propia (1)     -> 200
Estudiantes de sección ajena (3)      -> 403 :: {"error":"Access denied."}
Crear nota en inscripción propia (e1) -> 201
Crear nota en inscripción ajena (e10) -> 403 :: {"error":"Access denied."}
Editar nota ajena (grade 11)          -> 403 :: {"error":"Access denied."}
Editar nota propia (grade 1)          -> 200
```

**Control aplicado:** verificación de propiedad del recurso — se valida que la sección,
inscripción o calificación pertenezca al profesor autenticado
(`controllers/sections.ts`, `controllers/grades.ts`, `models/section.ts`).

✅ Cada intento de acceder a recursos de otro docente devuelve 403; los flujos
legítimos del profesor siguen operando.

---

## 8. Retest A02:2025 — Almacenamiento de contraseñas

**Vector:** exposición de credenciales si se filtra la base de datos.

Consulta directa a la base de datos en `version-asegurada`:

```bash
docker compose exec db psql -U devuser -d ciber_sim \
  -c "SELECT email, LEFT(password, 30) AS password_stored FROM users LIMIT 3;"
```

Resultado verificado:

```txt
        email         |        password_stored
----------------------+--------------------------------
 student1@example.com | $2b$10$SlE5X7rQVe2AQysStqMcXer
 student2@example.com | $2b$10$Ejc.aXjSAWc3jrJS0I1BY.D
 student3@example.com | $2b$10$u/06V8ntq4QxBls7JDrlfeV
```

Verificación funcional del login:

```txt
Login password correcta   -> 200
Login password incorrecta -> 401 :: {"error":"Invalid email or password."}
```

**Control aplicado:** las contraseñas se almacenan como hash bcrypt (cost 10, un salt
por usuario) y se verifican con `bcrypt.compare` (`services/auth.ts`).

✅ La base de datos no almacena contraseñas legibles. El login sigue funcionando.

---

## 9. Retest A05:2025 — Endurecimiento de la cookie de sesión

Cabecera `Set-Cookie` capturada del login en `version-asegurada`:

```txt
session_token=<token>; Path=/; HttpOnly; SameSite=Lax
```

| Flag | Vulnerable | Segura |
| --- | --- | --- |
| `HttpOnly` | ausente (`false`) | **presente** |
| `SameSite` | lax | lax |
| `secure` | ausente | activo en producción |

**Control aplicado:** cookie endurecida en `controllers/auth.ts`.

✅ El token de sesión deja de ser legible por JavaScript (mitiga robo vía XSS).

---

## 10. Mapeo OWASP Top 10:2025 y MITRE ATT&CK

| Hallazgo | OWASP | Técnicas MITRE (aprox.) | Resultado seguro |
| --- | --- | --- | --- |
| Error leak | A10 — Mishandling of Exceptional Conditions | T1595.002, T1071.001 | 400 genérico, sin detalles |
| IDOR estudiante | A01 — Broken Access Control | T1078, T1213, T1565 | 403 genérico |
| IDOR docente | A01 — Broken Access Control | T1078, T1213 | 403 genérico |
| Contraseñas planas | A02 — Cryptographic Failures | T1552.001 | hash bcrypt |
| Cookie débil | A05 — Security Misconfiguration | T1539 | HttpOnly + SameSite |

---

## 11. Cierre de la Tabla de Remediación (PRD sección 11)

| Debilidad vulnerable | Control en versión segura | Validación | Estado |
| --- | --- | --- | --- |
| Calificaciones por ID sin validar propiedad | Autorización server-side (estudiante y profesor) | 403 genérico | ✅ |
| ID no numérico llega a la consulta | Validación de parámetros antes de DB | 400 genérico | ✅ |
| SQL por concatenación | Consulta parametrizada | payload no altera SQL | ✅ |
| Errores técnicos al cliente | Handler centralizado + logging interno | sin stack trace | ✅ |
| Cookie de sesión simple | Flags básicos de cookie | HttpOnly + SameSite | ✅ |
| Passwords en texto plano | Hash bcrypt | DB sin texto plano | ✅ |

**Conclusión:** todos los controles definidos en la Tabla de Remediación del PRD están
implementados y verificados en `version-asegurada`. Los ataques principales A10 y A01
fallan de forma segura, y se endurecieron además A02 y A05 como mejoras defensivas.
