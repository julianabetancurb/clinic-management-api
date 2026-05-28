variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "clinic-api-terraform"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "db_password" {
  description = "Cloud SQL database password"
  type        = string
  sensitive   = true
  default     = "clinic123"
}

variable "database_url" {
  description = "Full database connection URL"
  type        = string
  sensitive   = true
}

variable "siguiente_api_url" {
  description = "URL of the next microservice in the chain"
  type        = string
  default     = ""
}
