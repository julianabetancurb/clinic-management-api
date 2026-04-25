resource "google_artifact_registry_repository" "clinic_api" {
  location      = var.region
  repository_id = "clinic-api"
  description   = "Docker repository for Clinic Management API"
  format        = "DOCKER"
  project       = var.project_id
}
