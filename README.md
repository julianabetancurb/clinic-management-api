# 🏥 Clinic Management API

API RESTful para la gestión de una clínica médica. Permite administrar doctores, pacientes y citas médicas con validaciones de negocio, dos ambientes independientes (pruebas y producción) y pipelines CI/CD automatizados.

---

## 🚀 Ambientes desplegados

| Ambiente | URL | Rama | Documentación |
|----------|-----|------|---------------|
| **Pruebas** | https://clinic-api-pruebas.onrender.com | `develop` | https://clinic-api-pruebas.onrender.com/docs |
| **Producción** | https://clinic-api-produccion.onrender.com | `main` | https://clinic-api-produccion.onrender.com/docs |

---

## 🏛️ Arquitectura

La aplicación sigue una **arquitectura modular en capas (Layered Modular Architecture)**, que es el patrón estándar de NestJS. Cada entidad está encapsulada en su propio módulo con capas bien definidas y separadas.

### Capas

| Capa | Responsabilidad | Archivos |
|------|----------------|---------|
| **Presentación** | Recibe y responde peticiones HTTP | `*.controller.ts` |
| **Negocio** | Validaciones y reglas de negocio | `*.service.ts` |
| **Datos** | Acceso a la base de datos | `prisma.service.ts` |

### Patrones utilizados

- **DTO (Data Transfer Object)** — valida y tipifica los datos de entrada en cada endpoint
- **Repository Pattern** — Prisma abstrae el acceso a la base de datos
- **Dependency Injection** — NestJS inyecta servicios en controllers automáticamente
- **Modular Architecture** — cada entidad (Doctor, Paciente, Cita) es un módulo independiente

### Flujo de una petición

```
HTTP Request
     ↓
Controller        ← valida entrada con DTO
     ↓
Service           ← aplica reglas de negocio
     ↓
PrismaService     ← ejecuta query en la BD
     ↓
PostgreSQL (Supabase)
     ↓
HTTP Response
```

---

## 🛠️ Tecnologías

- **Framework:** NestJS + TypeScript
- **ORM:** Prisma con driver adapter para PostgreSQL
- **Base de datos:** PostgreSQL (Supabase)
- **Contenedores:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Deploy:** Render
- **Tests:** Jest
- **Documentación:** Swagger / OpenAPI

---

## 📦 Entidades

### Doctor
Representa a un médico de la clínica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| documento | String | Documento de identidad (único) |
| nombres | String | Nombres del doctor |
| apellidos | String | Apellidos del doctor |
| especialidad | String | Especialidad médica |
| duracionCitaMin | Int | Duración en minutos de cada cita |
| createdAt | DateTime | Fecha de creación |

### Paciente
Representa a un paciente de la clínica.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| documento | String | Documento de identidad (único) |
| nombres | String | Nombres del paciente |
| apellidos | String | Apellidos del paciente |
| telefono | String | Teléfono de contacto |
| email | String | Correo electrónico |
| createdAt | DateTime | Fecha de creación |

### Cita
Representa una cita médica entre un paciente y un doctor.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| pacienteId | UUID | Referencia al paciente |
| doctorId | UUID | Referencia al doctor |
| fechaInicio | DateTime | Fecha y hora de inicio |
| fechaFin | DateTime | Fecha y hora de fin |
| motivo | String | Motivo de la consulta |
| estado | Enum | PENDIENTE / CONFIRMADA / CANCELADA / COMPLETADA |
| createdAt | DateTime | Fecha de creación |

---

## 📡 Endpoints

Todos los endpoints tienen el prefijo `/api`. La documentación interactiva está disponible en `/docs`.

### Doctores `/api/doctores`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/doctores` | Crear un doctor |
| `GET` | `/api/doctores` | Listar todos los doctores |
| `GET` | `/api/doctores/:id` | Obtener un doctor por ID |
| `PATCH` | `/api/doctores/:id` | Actualizar un doctor (parcial) |
| `DELETE` | `/api/doctores/:id` | Eliminar un doctor |
| `GET` | `/api/doctores/:id/citas` | Obtener citas de un doctor |

### Pacientes `/api/pacientes`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/pacientes` | Crear un paciente |
| `GET` | `/api/pacientes` | Listar todos los pacientes |
| `GET` | `/api/pacientes/:id` | Obtener un paciente por ID |
| `PATCH` | `/api/pacientes/:id` | Actualizar un paciente (parcial) |
| `DELETE` | `/api/pacientes/:id` | Eliminar un paciente |
| `GET` | `/api/pacientes/:id/citas` | Obtener citas de un paciente |

### Citas `/api/citas`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/citas` | Crear una cita |
| `GET` | `/api/citas` | Listar todas las citas |
| `GET` | `/api/citas/:id` | Obtener una cita por ID |
| `PATCH` | `/api/citas/:id` | Actualizar una cita (reprogramar / cambiar motivo) |
| `PATCH` | `/api/citas/:id/estado` | Actualizar el estado de una cita |
| `DELETE` | `/api/citas/:id` | Eliminar una cita |

---

## 🐳 Correr localmente con Docker

### Prerequisitos
- Docker Desktop instalado y corriendo
- Archivo `.env` configurado

### Variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/clinic_db
PORT=3000
```

### Levantar con Docker Compose

```bash
# Levantar app + base de datos
docker-compose up

# En segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Correr migraciones (primera vez)

```bash
npx prisma migrate deploy
```

La app estará disponible en `http://localhost:3000/api` y la documentación en `http://localhost:3000/docs`.

---

## 🧪 Tests y cobertura

### Correr los tests

```bash
# Todos los tests
npm run test

# Con coverage
npm run test:cov

# Modo watch
npm run test:watch
```

### Resultado de cobertura actual

| Archivo | Statements | Branch | Functions | Lines |
|---------|-----------|--------|-----------|-------|
| **Total** | 96.35% | 84.48% | 97.95% | **98.21%** |
| citas.controller.ts | 100% | 75% | 100% | 100% |
| citas.service.ts | 96.22% | 88% | 100% | 100% |
| doctores.controller.ts | 100% | 75% | 100% | 100% |
| doctores.service.ts | 100% | 91.66% | 100% | 100% |
| pacientes.controller.ts | 100% | 75% | 100% | 100% |
| pacientes.service.ts | 100% | 91.66% | 100% | 100% |
| prisma.service.ts | 100% | 100% | 100% | 100% |

### Estructura de tests
- **Servicios:** pruebas unitarias con mock de Prisma (`prisma.mock.ts`)
- **Controllers:** pruebas unitarias con mock de servicios
- **Total:** 76 pruebas

---

## ⚙️ Pipelines CI/CD

El proyecto usa **GitHub Actions** con 2 pipelines independientes.

### Pipeline de Pruebas (`develop.yml`)
Se dispara en cada push o PR a la rama `develop`.

```
1. Checkout del código
2. Setup Node.js 20
3. Instalación de dependencias (npm ci)
4. Generación del cliente Prisma
5. Ejecución de pruebas con coverage
6. Quality gate: cobertura mínima >= 60%
7. Deploy automático a Render (ambiente Pruebas)
```

### Pipeline de Producción (`main.yml`)
Se dispara en cada push o PR a la rama `main`.

```
1. Checkout del código
2. Setup Node.js 20
3. Instalación de dependencias (npm ci)
4. Generación del cliente Prisma
5. Ejecución de pruebas con coverage
6. Quality gate: cobertura mínima >= 85%
7. Deploy automático a Render (ambiente Producción)
```

### Reglas de aprobación obligatorias
- Si **cualquier prueba falla** el pipeline se detiene y **no despliega**
- Si el **coverage es menor al mínimo** el pipeline se detiene y **no despliega**
- Solo se despliega cuando **0 pruebas con errores** y **coverage suficiente**

### Secrets requeridos en GitHub

| Secret | Descripción |
|--------|-------------|
| `DATABASE_URL_PRUEBAS` | URL de BD Supabase para pruebas |
| `DATABASE_URL_PRODUCCION` | URL de BD Supabase para producción |
| `RENDER_DEPLOY_HOOK_PRUEBAS` | Deploy hook de Render para pruebas |
| `RENDER_DEPLOY_HOOK_PRODUCCION` | Deploy hook de Render para producción |

---

## 🌿 Estrategia de ramas

| Rama | Propósito | Pipeline | Cobertura mínima |
|------|-----------|----------|-----------------|
| `develop` | Desarrollo y pruebas | `develop.yml` | >= 60% |
| `main` | Producción | `main.yml` | >= 85% |
| `feature/*` | Nuevas funcionalidades | — | — |

El flujo de trabajo es: `feature/* → develop → main`

---

## 📁 Estructura del proyecto

```
clinic-management-api/
├── .github/
│   └── workflows/
│       ├── develop.yml       # Pipeline pruebas
│       └── main.yml          # Pipeline producción
├── prisma/
│   ├── schema.prisma         # Esquema de la BD
│   └── migrations/           # Migraciones
├── src/
│   ├── citas/
│   │   ├── dto/
│   │   ├── citas.controller.ts
│   │   ├── citas.controller.spec.ts
│   │   ├── citas.service.ts
│   │   └── citas.service.spec.ts
│   ├── doctores/
│   │   ├── dto/
│   │   ├── doctores.controller.ts
│   │   ├── doctores.controller.spec.ts
│   │   ├── doctores.service.ts
│   │   └── doctores.service.spec.ts
│   ├── pacientes/
│   │   ├── dto/
│   │   ├── pacientes.controller.ts
│   │   ├── pacientes.controller.spec.ts
│   │   ├── pacientes.service.ts
│   │   └── pacientes.service.spec.ts
│   ├── prisma/
│   │   ├── prisma.service.ts
│   │   ├── prisma.service.spec.ts
│   │   └── prisma.mock.ts
│   └── main.ts
├── docker-compose.yml        # Orquestación local
├── Dockerfile                # Imagen de producción
└── README.md
```
