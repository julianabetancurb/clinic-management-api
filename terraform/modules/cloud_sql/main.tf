resource "google_sql_database_instance" "clinic_db" {
  name             = "clinic-db"
  database_version = "POSTGRES_15"
  region           = var.region
  project          = var.project_id

  settings {
    tier = "db-f1-micro"

    ip_configuration {
      ipv4_enabled = true

      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }

    database_flags {
      name  = "cloudsql.enable_pg_cron"
      value = "off"
    }
  }

  deletion_protection = false
}

resource "google_sql_database" "clinic" {
  name     = "clinic_db"
  instance = google_sql_database_instance.clinic_db.name
  project  = var.project_id
}

resource "google_sql_user" "clinic_user" {
  name     = "clinic_user"
  instance = google_sql_database_instance.clinic_db.name
  password = var.db_password
  project  = var.project_id
}
