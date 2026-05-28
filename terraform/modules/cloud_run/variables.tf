variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
}

variable "image_url" {
  description = "Docker image URL from Artifact Registry"
  type        = string
}

variable "database_url" {
  description = "Database connection URL"
  type        = string
  sensitive   = true
}

variable "siguiente_api_url" {
  description = "URL of the next microservice in the chain"
  type        = string
  default     = ""
}
