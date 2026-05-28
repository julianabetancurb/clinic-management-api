output "cloud_run_url" {
  description = "URL of the deployed Cloud Run service"
  value       = module.cloud_run.service_url
}

output "cloud_sql_ip" {
  description = "Public IP of the Cloud SQL instance"
  value       = module.cloud_sql.instance_ip
}

output "artifact_registry_url" {
  description = "Artifact Registry repository URL"
  value       = module.artifact_registry.repository_url
}
