# 🏗️ Terraform — Clinic Management API

Infraestructura como código para desplegar la Clinic Management API en Google Cloud Platform.

## 📦 Servicios desplegados

| Servicio | Descripción |
|----------|-------------|
| **VPC + Firewall** | Red privada con reglas SSH y PostgreSQL |
| **Artifact Registry** | Repositorio de imágenes Docker |
| **Cloud SQL** | Base de datos PostgreSQL 15 |
| **Cloud Run** | Servicio serverless para la API |

## 📁 Estructura

```
terraform/
├── main.tf           — llama a todos los módulos
├── variables.tf      — variables globales
├── outputs.tf        — outputs globales
├── provider.tf       — configuración del provider GCP
├── scripts.sql       — scripts de base de datos
└── modules/
    ├── vpc/              — red y firewall
    ├── artifact_registry/ — registro de imágenes Docker
    ├── cloud_sql/        — base de datos
    └── cloud_run/        — servicio de la API
```

## 🚀 Cómo ejecutar el despliegue

### Prerequisitos
- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.0
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
- Cuenta de GCP con proyecto `clinic-api-devops`

### 1. Autenticarse en GCP

```bash
gcloud auth application-default login
```

### 2. Inicializar Terraform

```bash
cd terraform
terraform init
```

### 3. Construir y subir la imagen Docker

Antes de aplicar, necesitas tener la imagen en Artifact Registry:

```bash
# Configurar Docker para GCP
gcloud auth configure-docker us-central1-docker.pkg.dev

# Construir la imagen
docker build -t us-central1-docker.pkg.dev/clinic-api-devops/clinic-api/clinic-api:latest .

# Subir la imagen
docker push us-central1-docker.pkg.dev/clinic-api-devops/clinic-api/clinic-api:latest
```

### 4. Crear archivo terraform.tfvars

```hcl
project_id        = "clinic-api-devops"
region            = "us-central1"
db_password       = "clinic123"
database_url      = "postgresql://clinic_user:clinic123@<IP_CLOUD_SQL>:5432/clinic_db"
siguiente_api_url = "http://34.45.249.45:3000/api/v2/directors"
```

> **Nota:** La IP de Cloud SQL la obtienes después de correr `terraform apply` por primera vez con solo el módulo de Cloud SQL.

### 5. Ver el plan

```bash
terraform plan
```

### 6. Aplicar la infraestructura

```bash
terraform apply
```

### 7. Obtener la URL de la API

```bash
terraform output cloud_run_url
```

---

## 🗄️ Scripts de base de datos

Conectarse a la BD via SSH:

```bash
psql "postgresql://clinic_user:clinic123@<IP_CLOUD_SQL>:5432/clinic_db"
```

### Script 1 — Crear tablas
```bash
psql "postgresql://clinic_user:clinic123@<IP_CLOUD_SQL>:5432/clinic_db" -f scripts.sql
```

El archivo `scripts.sql` contiene los 3 scripts en orden:
1. **Crear tablas** — Doctor, Paciente, Cita
2. **Insertar datos** — datos de prueba y visualización
3. **Drop** — elimina todas las tablas

---

## 🗑️ Eliminar la infraestructura

```bash
terraform destroy
```

Confirma con `yes` cuando te lo pida.
