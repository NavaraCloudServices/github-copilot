# Local Terraform Setup Guide

This guide explains how to run Terraform locally to manage your Azure infrastructure.

## Prerequisites

1. **Install Terraform**
   ```bash
   # macOS
   brew install terraform
   
   # Windows
   choco install terraform
   
   # Linux
   curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
   sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
   sudo apt-get update && sudo apt-get install terraform
   ```

2. **Install Azure CLI**
   ```bash
   # macOS
   brew install azure-cli
   
   # Windows
   choco install azure-cli
   
   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

## Authentication Setup

### Option 1: Azure CLI Authentication (Recommended for local development)
```bash
# Login to Azure
az login

# Set your subscription (if you have multiple)
az account set --subscription "Your-Subscription-ID"

# Verify your authentication
az account show
```

### Option 2: Service Principal Authentication
```bash
# Create a service principal
az ad sp create-for-rbac --name "terraform-sp" --role="Contributor" --scopes="/subscriptions/YOUR_SUBSCRIPTION_ID"

# Export environment variables
export ARM_CLIENT_ID="your-client-id"
export ARM_CLIENT_SECRET="your-client-secret" 
export ARM_SUBSCRIPTION_ID="your-subscription-id"
export ARM_TENANT_ID="your-tenant-id"
```

## Configuration

1. **Create terraform.tfvars file**
   ```bash
   cd terraform
   cp terraform.tfvars.example terraform.tfvars
   ```

2. **Edit terraform.tfvars with your values**
   ```hcl
   resource_group_name = "rg-leaderboard-dev"
   location = "East US"
   environment = "dev"
   postgresql_admin_username = "your_admin_user"
   postgresql_admin_password = "your_secure_password"
   container_image = "acracaleaderboarddev/leaderboard:latest"
   ```

## Running Terraform

1. **Initialize Terraform**
   ```bash
   cd terraform
   terraform init
   ```

2. **Plan your deployment**
   ```bash
   terraform plan
   ```

3. **Apply your changes**
   ```bash
   terraform apply
   ```

4. **View outputs**
   ```bash
   terraform output
   ```

5. **Destroy infrastructure (when needed)**
   ```bash
   terraform destroy
   ```

## Important Notes

- **State Management**: By default, Terraform stores state locally in `terraform.tfstate`. For production, consider using remote state storage (Azure Storage Account).
- **Secrets**: Never commit `terraform.tfvars` or any files containing secrets to version control.
- **Environment Variables**: You can also set variables via environment variables with `TF_VAR_` prefix:
  ```bash
  export TF_VAR_postgresql_admin_password="your_password"
  ```

## Terraform State Best Practices

For production environments, configure remote state storage:

```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "stterraformstate"
    container_name       = "tfstate"
    key                  = "leaderboard.tfstate"
  }
}
```

## Common Commands

- `terraform validate` - Validate configuration syntax
- `terraform fmt` - Format configuration files
- `terraform show` - Show current state
- `terraform refresh` - Update state with real infrastructure
- `terraform import` - Import existing resources into state

## Troubleshooting

1. **Authentication Issues**: Ensure you're logged into Azure CLI or have set the correct environment variables
2. **Resource Conflicts**: Check if resources already exist with the same names
3. **Permission Issues**: Verify your account has sufficient permissions to create resources
4. **State Lock Issues**: If using remote state, check for lock files in storage