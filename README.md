# Clinic Management API — Canary Deployment

## Estrategia de Redirección de Tráfico

### Implementación

Se uso **Kubernetes en Google Kubernetes Engine (GKE)** con los siguientes componentes:

| Componente | Recurso | Descripción |
|---|---|---|
| Deployment estable | `clinic-api-stable` | Versión productiva con 3 réplicas |
| Deployment canary | `clinic-api-canary` | Nueva versión con 1 réplica |
| Servicio común | `clinic-api-service` | Balancea tráfico entre ambos deployments |
| Ingress | `clinic-api-ingress` | Punto de entrada único con health checks configurados |
| BackendConfig | `clinic-api-backend-config` | Configura el health check en `/api/health` puerto 3000 |

### Distribución del tráfico

El control de tráfico se logra mediante el numero de replicas. 
```
Stable  (3 réplicas) →  75% del tráfico
Canary  (1 réplica)  →  25% del tráfico
```

---

## Validación con Postman

**Base URL:** `http://34.117.53.178`

### Health Check

Endpoint principal para observar la estrategia de redirección. Al enviarse múltiples veces, la respuesta alterna entre la versión stable y canary según el split configurado.

| Campo | Valor |
|---|---|
| Método | `GET` |
| URL | `http://34.117.53.178/api/health` |

**Respuesta — versión Stable:**
```json
{
  "status": "stable",
  "version": "1.0.0",
  "deploymentDate": "2026-06-03",
  "service": "clinic-management-api",
  "environment": "production",
  "visibleChange": "Stable production version"
}
```

**Respuesta — versión Canary:**
```json
{
  "status": "canary",
  "version": "canary",
  "deploymentDate": "2026-06-03",
  "service": "clinic-management-api",
  "environment": "production",
  "visibleChange": "Canary version - new feature"
}
```

### Nuevos endpoints disponibles

| Método | URL | Descripción |
|---|---|---|
| `GET` | `http://34.117.53.178/api/health` | Health check con información de versión |

y las que ya estaban predeterminadas al inicio del proyecto
---

## Monitoreo de la Estrategia de Redirección

### Opción 1 — Terminal

Ejecutar múltiples requests consecutivas para observar la alternancia entre versiones:

```bash
for i in {1..20}; do
  curl -s http://34.117.53.178/api/health | grep -E "status|version"
  echo "---"
done
```

El resultado muestra cuántas respuestas corresponden a `stable` vs `canary`, validando el split 75/25.

### Opción 2 — kubectl (estado de pods y logs)

```bash
# Ver pods activos de ambos deployments
kubectl get pods -l app=clinic-api -o wide

# Logs en tiempo real del deployment canary
kubectl logs -l app=clinic-api-canary -f

# Logs en tiempo real del deployment stable
kubectl logs -l app=clinic-api-stable -f
```

### Opción 3 — Estado del Ingress y backends en GCP

```bash
# Estado de salud de los backends registrados en el Ingress
kubectl describe ingress clinic-api-ingress

# Health de cada endpoint en el Load Balancer de GCP
gcloud compute backend-services get-health \
  $(gcloud compute backend-services list --format='value(name)' | grep clinic) \
  --global
```

### Opción 4 — Google Cloud Console

1. Navegar a **GCP Console → Kubernetes Engine → Workloads**
   - Se visualizan `clinic-api-stable` y `clinic-api-canary` como deployments independientes con sus réplicas activas.

2. Navegar a **Network Services → Load Balancing**
   - Se muestra el estado de los backends (HEALTHY/UNHEALTHY) y el health check configurado.

3. Navegar a **Monitoring → Metrics Explorer**
   - Usar la métrica `kubernetes.io/container/request_count` filtrando por pod para graficar la distribución real del tráfico entre ambas versiones.

---

## Estructura del Proyecto

```
clinic-management-api/
├── k8s/
│   ├── stable-deployment.yaml   # Deployment versión stable (3 réplicas)
│   ├── canary-deployment.yaml   # Deployment versión canary (1 réplica)
│   ├── service.yaml             # Servicio común para ambos deployments
│   └── ingress.yaml             # Ingress con rutas /api y /health
├── backend-config.yaml          # Configuración del health check para GCP Load Balancer
└── README.md
```

## Comandos de Despliegue

```bash
# Aplicar manifests en orden
kubectl apply -f k8s/stable-deployment.yaml
kubectl apply -f k8s/canary-deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f backend-config.yaml
kubectl apply -f k8s/ingress.yaml

# Verificar el estado del cluster
kubectl get deployments
kubectl get pods -o wide
kubectl get svc
kubectl get ingress
```
