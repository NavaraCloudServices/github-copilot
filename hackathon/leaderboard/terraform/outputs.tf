output "container_app_fqdn" {
  description = "The fully qualified domain name of the container app"
  value       = azurerm_container_app.main.latest_revision_fqdn
}

output "container_app_url" {
  description = "The URL of the container app"
  value       = "https://${azurerm_container_app.main.latest_revision_fqdn}"
}

output "postgresql_connection_string" {
  description = "The connection string for the PostgreSQL server"
  value       = "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}:${urlencode(var.postgresql_admin_password)}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
  sensitive   = true
}

output "storage_account_name" {
  description = "The name of the storage account"
  value       = azurerm_storage_account.main.name
}

output "storage_account_primary_access_key" {
  description = "The primary access key for the storage account"
  value       = azurerm_storage_account.main.primary_access_key
  sensitive   = true
}

output "app_insights_instrumentation_key" {
  description = "The instrumentation key for Application Insights"
  value       = azurerm_application_insights.main.instrumentation_key
  sensitive   = true
}

output "container_registry_login_server" {
  description = "The login server for the container registry"
  value       = azurerm_container_registry.main.login_server
}

output "postgresql_admin_username" {
  description = "The admin username for the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.administrator_login
}

output "postgresql_fqdn" {
  description = "The FQDN of the PostgreSQL server"
  value       = azurerm_postgresql_flexible_server.main.fqdn
}

output "postgresql_database_name" {
  description = "The name of the PostgreSQL database"
  value       = azurerm_postgresql_flexible_server_database.main.name
}