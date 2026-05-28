resource "google_cloud_run_v2_service" "clinic_api" {
  name     = "clinic-api"
  location = var.region
  project  = var.project_id

  ingress = "INGRESS_TRAFFIC_ALL"

  template {
    containers {
      image = var.image_url

      ports {
        container_port = 8080
      }

      env {
        name  = "DATABASE_URL"
        value = var.database_url
      }

      env {
        name  = "SIGUIENTE_API_URL"
        value = var.siguiente_api_url
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }
    }
  }
}

resource "google_cloud_run_v2_service_iam_member" "allow_unauthenticated" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.clinic_api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
