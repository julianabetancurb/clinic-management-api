module "vpc" {
  source     = "./modules/vpc"
  project_id = var.project_id
  region     = var.region
}

module "artifact_registry" {
  source     = "./modules/artifact_registry"
  project_id = var.project_id
  region     = var.region
}

module "cloud_sql" {
  source      = "./modules/cloud_sql"
  project_id  = var.project_id
  region      = var.region
  db_password = var.db_password
  network_id  = module.vpc.network_id
}

module "cloud_run" {
  source            = "./modules/cloud_run"
  project_id        = var.project_id
  region            = var.region
  database_url      = var.database_url
  siguiente_api_url = var.siguiente_api_url
  image_url         = "${var.region}-docker.pkg.dev/${var.project_id}/clinic-api/clinic-api:latest"

  depends_on = [module.artifact_registry, module.cloud_sql]
}
