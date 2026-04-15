# 🏥 Clinic Management API

API RESTful para la gestión de una clínica médica. Permite administrar doctores, pacientes y citas médicas con validaciones de negocio, dos ambientes independientes (pruebas y producción) y pipelines CI/CD automatizados.

---

## 🚀 Ambientes desplegados

| Ambiente | URL | Rama | Documentación |
|----------|-----|------|---------------|
| **Pruebas** | https://clinic-api-pruebas.onrender.com | `develop` | https://clinic-api-pruebas.onrender.com/docs |
| **Producción** | https://clinic-api-produccion.onrender.com | `main` | https://clinic-api-produccion.onrender.com/docs |

> **Nota:** Todos los endpoints requieren el prefijo `/api`. Ejemplo: `https://clinic-api-pruebas.onrender.com/api/pacientes`

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
- **Documentación:** Swagger

---

## 📦 Entidades

### Doctor
Representa a un médico de la clínica.

### Paciente
Representa a un paciente de la clínica.

### Cita
Representa una cita médica entre un paciente y un doctor.


---
## 🗄️ Modelo de base de datos

![Modelo de base de datos](docs/db-model.png)

## 📡 Endpoints

Todos los endpoints tienen el prefijo `/api`. La documentación interactiva está disponible en `/docs`.

### Doctores `/api/doctores`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/doctores` | Crear un doctor |
| `GET` | `/api/doctores` | Listar todos los doctores |
| `GET` | `/api/doctores/:id` | Obtener un doctor por ID |
| `PATCH` | `/api/doctores/:id` | Actualizar un doctor |
| `DELETE` | `/api/doctores/:id` | Eliminar un doctor |
| `GET` | `/api/doctores/:id/citas` | Obtener citas de un doctor |

### Pacientes `/api/pacientes`

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/pacientes` | Crear un paciente |
| `GET` | `/api/pacientes` | Listar todos los pacientes |
| `GET` | `/api/pacientes/:id` | Obtener un paciente por ID |
| `PATCH` | `/api/pacientes/:id` | Actualizar un paciente |
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
---
# Dosctores V2
Microservicio desarrollado en NestJS como parte de una arquitectura distribuida multicloud.  
Esta versión (V2) introduce un flujo de integración entre microservicios, despliegue en GCP y mejoras en observabilidad.
Usando:
- **Google Cloud Platform (GCP)**:
  - Cloud Run
  - Cloud Build
  - Artifact Registry
  - Cloud SQL
  - Cloud Logging

### Endpoint principal 
POST /api/v2/doctores/proceso

### Monitoreo
GET /api/v2/metrics/summary
GET /api/v2/metrics

---

### Arquitectura 



