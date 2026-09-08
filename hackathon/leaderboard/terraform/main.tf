terraform {
  backend "azurerm" {
    storage_account_name = "tfstategithubcopilot"
    container_name       = "tfstategithubcopilot"
    key                  = "prd.tfstategithubcopilot.tfstate"
    resource_group_name  = "rg-githubcopilot"
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~>3.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~>3.1"
    }
  }
}

provider "azurerm" {
  features {}
}

resource "random_password" "session_secret" {
  length  = 32
  special = true
}

data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}

resource "azurerm_container_registry" "main" {
  name                          = "acracaleaderboard${var.environment}"
  resource_group_name           = data.azurerm_resource_group.main.name
  location                      = data.azurerm_resource_group.main.location
  sku                           = "Basic"
  admin_enabled                 = true
  public_network_access_enabled = true

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                          = "psql-leaderboard-${var.environment}"
  resource_group_name           = data.azurerm_resource_group.main.name
  location                      = data.azurerm_resource_group.main.location
  version                       = "14"
  administrator_login           = var.postgresql_admin_username
  administrator_password        = var.postgresql_admin_password
  zone                          = "2"
  storage_mb                    = 32768
  sku_name                      = "B_Standard_B1ms"
  public_network_access_enabled = true

  backup_retention_days        = 7
  geo_redundant_backup_enabled = false

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "leaderboard_db"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_firewall_rule" "azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

resource "azurerm_storage_account" "main" {
  name                     = "stleaderboard${var.environment}"
  resource_group_name      = data.azurerm_resource_group.main.name
  location                 = data.azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"

  tags = {
    environment = var.environment
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_storage_container" "main" {
  name                  = "challenges"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "private"
}

resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-leaderboard-${var.environment}"
  location            = data.azurerm_resource_group.main.location
  resource_group_name = data.azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_application_insights" "main" {
  name                = "appi-leaderboard-${var.environment}"
  location            = data.azurerm_resource_group.main.location
  resource_group_name = data.azurerm_resource_group.main.name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "Node.JS"

  lifecycle {
    ignore_changes = [tags]
  }
}

# Removed VNet configuration - using public access for cost efficiency

resource "azurerm_container_app_environment" "main" {
  name                       = "cae-leaderboard-${var.environment}"
  location                   = data.azurerm_resource_group.main.location
  resource_group_name        = data.azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  tags = {
    environment = var.environment
  }

  lifecycle {
    ignore_changes = [tags]
  }
}

resource "azurerm_container_app" "main" {
  name                         = "ca-leaderboard-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = data.azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    min_replicas = 1
    max_replicas = 2

    container {
      name   = "leaderboard"
      image  = "${var.acr_login_server}/leaderboard:latest"
      cpu    = 0.5
      memory = "1Gi"

      env {
        name  = "DATABASE_URL"
        value = "postgresql://${azurerm_postgresql_flexible_server.main.administrator_login}:${urlencode(var.postgresql_admin_password)}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.main.name}?sslmode=require"
      }

      env {
        name  = "STORAGE_ACCOUNT_NAME"
        value = azurerm_storage_account.main.name
      }

      env {
        name  = "STORAGE_ACCOUNT_KEY"
        value = azurerm_storage_account.main.primary_access_key
      }

      env {
        name  = "APPINSIGHTS_INSTRUMENTATIONKEY"
        value = azurerm_application_insights.main.instrumentation_key
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "PORT"
        value = "3000"
      }

      env {
        name  = "SESSION_SECRET"
        value = "azure-production-secret-${random_password.session_secret.result}"
      }
    }
  }

  ingress {
    allow_insecure_connections = true
    external_enabled           = true
    target_port                = 3000

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  registry {
    server               = azurerm_container_registry.main.login_server
    username             = azurerm_container_registry.main.admin_username
    password_secret_name = "registry-password"
  }

  secret {
    name  = "registry-password"
    value = azurerm_container_registry.main.admin_password
  }

  tags = {
    environment = var.environment
  }

  lifecycle {
    ignore_changes = [tags]
  }
}
