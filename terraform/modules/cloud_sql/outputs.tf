output "instance_ip" {
  description = "Public IP of the Cloud SQL instance"
  value       = google_sql_database_instance.clinic_db.public_ip_address
}

output "instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.clinic_db.name
}

output "database_name" {
  description = "Database name"
  value       = google_sql_database.clinic.name
}
