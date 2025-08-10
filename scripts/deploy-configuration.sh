#!/bin/bash

# Configuration Deployment Script
# This script deploys configuration changes across different environments
# with proper validation and rollback capabilities.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    
    case $status in
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
    esac
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] <environment>"
    echo
    echo "Options:"
    echo "  -c, --config-type TYPE    Type of configuration to deploy (all, infrastructure, application, settings)"
    echo "  -f, --force               Force deployment (bypass some checks)"
    echo "  -r, --rollback            Rollback to previous configuration"
    echo "  -v, --validate-only       Only validate configuration without deploying"
    echo "  -h, --help                Show this help message"
    echo
    echo "Environments:"
    echo "  development               Deploy to development environment"
    echo "  staging                   Deploy to staging environment"
    echo "  production                Deploy to production environment"
    echo
    echo "Examples:"
    echo "  $0 staging                           # Deploy all configuration to staging"
    echo "  $0 -c settings production           # Deploy only settings to production"
    echo "  $0 -v development                   # Validate development configuration only"
    echo "  $0 -r staging                       # Rollback staging configuration"
}

# Function to validate deployment parameters
validate_deployment_params() {
    local env_name=$1
    local config_type=$2
    
    # Validate environment
    local valid_environments=("development" "staging" "production")
    local valid_env=false
    
    for env in "${valid_environments[@]}"; do
        if [ "$env_name" = "$env" ]; then
            valid_env=true
            break
        fi
    done
    
    if [ "$valid_env" = false ]; then
        print_status "ERROR" "Invalid environment: $env_name. Valid options: ${valid_environments[*]}"
        return 1
    fi
    
    # Validate configuration type
    local valid_config_types=("all" "infrastructure" "application" "settings")
    local valid_config=false
    
    for config in "${valid_config_types[@]}"; do
        if [ "$config_type" = "$config" ]; then
            valid_config=true
            break
        fi
    done
    
    if [ "$valid_config" = false ]; then
        print_status "ERROR" "Invalid configuration type: $config_type. Valid options: ${valid_config_types[*]}"
        return 1
    fi
    
    return 0
}

# Function to create deployment backup
create_deployment_backup() {
    local env_name=$1
    local backup_dir="deployment-backups/$(date +%Y%m%d-%H%M%S)-$env_name"
    
    print_status "INFO" "Creating deployment backup in $backup_dir"
    
    mkdir -p "$backup_dir"
    
    # Backup current configuration
    if [ -d "infrastructure/kubernetes/configmaps" ]; then
        cp -r infrastructure/kubernetes/configmaps "$backup_dir/"
    fi
    
    if [ -f "src/frontend/config/settings.$env_name.json" ]; then
        cp "src/frontend/config/settings.$env_name.json" "$backup_dir/"
    fi
    
    if [ -f "src/frontend/env.$env_name" ]; then
        cp "src/frontend/env.$env_name" "$backup_dir/"
    fi
    
    # Create backup manifest
    cat > "$backup_dir/backup-manifest.txt" << EOF
Backup created: $(date)
Environment: $env_name
Backup ID: $(date +%Y%m%d-%H%M%S)-$env_name
Files backed up:
- Kubernetes ConfigMaps
- Settings configuration
- Environment variables
EOF
    
    print_status "SUCCESS" "Deployment backup created: $backup_dir"
    echo "$backup_dir"
}

# Function to deploy infrastructure configuration
deploy_infrastructure() {
    local env_name=$1
    local force_deploy=$2
    
    print_status "INFO" "Deploying infrastructure configuration to $env_name environment"
    
    if [ ! -d "infrastructure/terraform" ]; then
        print_status "ERROR" "Terraform configuration directory not found"
        return 1
    fi
    
    cd infrastructure/terraform
    
    # Initialize Terraform
    print_status "INFO" "Initializing Terraform..."
    terraform init
    
    # Plan deployment
    print_status "INFO" "Planning Terraform deployment..."
    local plan_file="deployment-plan-$env_name.tfplan"
    
    if [ -f "environments/$env_name.tfvars" ]; then
        terraform plan -var-file="environments/$env_name.tfvars" -out="$plan_file"
    else
        print_status "WARNING" "Environment-specific variables file not found, using defaults"
        terraform plan -out="$plan_file"
    fi
    
    # Apply changes
    if [ "$force_deploy" = true ]; then
        print_status "WARNING" "Force deploying infrastructure changes..."
        terraform apply "$plan_file"
    else
        print_status "INFO" "Applying infrastructure changes..."
        terraform apply "$plan_file"
    fi
    
    cd - > /dev/null
    
    print_status "SUCCESS" "Infrastructure configuration deployed to $env_name"
}

# Function to deploy application configuration
deploy_application_config() {
    local env_name=$1
    
    print_status "INFO" "Deploying application configuration to $env_name environment"
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        print_status "ERROR" "kubectl not found - cannot deploy application configuration"
        return 1
    fi
    
    # Deploy environment-specific configuration
    local configmap_name="app-config-$env_name"
    
    print_status "INFO" "Creating ConfigMap: $configmap_name"
    
    kubectl create configmap "$configmap_name" \
        --from-file="env.$env_name=src/frontend/env.$env_name" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy application resources
    print_status "INFO" "Deploying application resources..."
    
    if [ -d "infrastructure/kubernetes/deployments" ]; then
        kubectl apply -f infrastructure/kubernetes/deployments/
    fi
    
    if [ -d "infrastructure/kubernetes/services" ]; then
        kubectl apply -f infrastructure/kubernetes/services/
    fi
    
    if [ -d "infrastructure/kubernetes/ingress" ]; then
        kubectl apply -f infrastructure/kubernetes/ingress/
    fi
    
    print_status "SUCCESS" "Application configuration deployed to $env_name"
}

# Function to deploy settings configuration
deploy_settings_config() {
    local env_name=$1
    
    print_status "INFO" "Deploying settings configuration to $env_name environment"
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        print_status "ERROR" "kubectl not found - cannot deploy settings configuration"
        return 1
    fi
    
    # Deploy settings-specific configuration
    local settings_configmap="settings-config-$env_name"
    
    print_status "INFO" "Creating settings ConfigMap: $settings_configmap"
    
    # Create settings ConfigMap from environment-specific values
    kubectl create configmap "$settings_configmap" \
        --from-file="app-settings.json=src/frontend/config/settings.$env_name.json" \
        --from-file="feature-flags.json=src/frontend/config/settings.$env_name.json" \
        --dry-run=client -o yaml | kubectl apply -f -
    
    # Update feature flags based on environment
    print_status "INFO" "Updating feature flags for $env_name environment..."
    
    local debug_mode="false"
    local beta_features="false"
    
    if [ "$env_name" = "development" ] || [ "$env_name" = "staging" ]; then
        debug_mode="true"
        beta_features="true"
    fi
    
    kubectl patch configmap feature-flags -n dealcycle-crm --patch-file=- << EOF
data:
  debug-mode: "$debug_mode"
  beta-features: "$beta_features"
  environment: "$env_name"
EOF
    
    print_status "SUCCESS" "Settings configuration deployed to $env_name"
}

# Function to validate deployment
validate_deployment() {
    local env_name=$1
    
    print_status "INFO" "Validating deployment to $env_name environment"
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        print_status "WARNING" "kubectl not found - skipping deployment validation"
        return 0
    fi
    
    # Check application health
    print_status "INFO" "Checking application health..."
    
    # Wait for deployments to be ready
    kubectl rollout status deployment/dealcycle-frontend -n dealcycle-crm --timeout=300s || {
        print_status "ERROR" "Frontend deployment failed to become ready"
        return 1
    }
    
    kubectl rollout status deployment/dealcycle-backend -n dealcycle-crm --timeout=300s || {
        print_status "ERROR" "Backend deployment failed to become ready"
        return 1
    }
    
    # Check service endpoints
    print_status "INFO" "Checking service endpoints..."
    kubectl get services -n dealcycle-crm
    
    # Check ingress configuration
    print_status "INFO" "Checking ingress configuration..."
    kubectl get ingress -n dealcycle-crm
    
    print_status "SUCCESS" "Deployment validation completed for $env_name"
}

# Function to rollback configuration
rollback_configuration() {
    local env_name=$1
    local backup_dir=$2
    
    if [ -z "$backup_dir" ]; then
        print_status "ERROR" "No backup directory specified for rollback"
        return 1
    fi
    
    if [ ! -d "$backup_dir" ]; then
        print_status "ERROR" "Backup directory not found: $backup_dir"
        return 1
    fi
    
    print_status "INFO" "Rolling back configuration from backup: $backup_dir"
    
    # Restore Kubernetes ConfigMaps
    if [ -d "$backup_dir/configmaps" ]; then
        print_status "INFO" "Restoring Kubernetes ConfigMaps..."
        kubectl apply -f "$backup_dir/configmaps/"
    fi
    
    # Restore settings configuration
    if [ -f "$backup_dir/settings.$env_name.json" ]; then
        print_status "INFO" "Restoring settings configuration..."
        cp "$backup_dir/settings.$env_name.json" "src/frontend/config/settings.$env_name.json"
    fi
    
    # Restore environment variables
    if [ -f "$backup_dir/env.$env_name" ]; then
        print_status "INFO" "Restoring environment variables..."
        cp "$backup_dir/env.$env_name" "src/frontend/env.$env_name"
    fi
    
    print_status "SUCCESS" "Configuration rollback completed from $backup_dir"
}

# Main deployment function
deploy_configuration() {
    local env_name=$1
    local config_type=$2
    local force_deploy=$3
    local validate_only=$4
    
    print_status "INFO" "Starting configuration deployment to $env_name environment"
    print_status "INFO" "Configuration type: $config_type"
    print_status "INFO" "Force deploy: $force_deploy"
    print_status "INFO" "Validate only: $validate_only"
    echo
    
    # Validate deployment parameters
    if ! validate_deployment_params "$env_name" "$config_type"; then
        exit 1
    fi
    
    # Create deployment backup
    local backup_dir=""
    if [ "$validate_only" = false ]; then
        backup_dir=$(create_deployment_backup "$env_name")
    fi
    
    # Deploy based on configuration type
    case $config_type in
        "all")
            if [ "$validate_only" = false ]; then
                deploy_infrastructure "$env_name" "$force_deploy"
                deploy_application_config "$env_name"
                deploy_settings_config "$env_name"
            fi
            ;;
        "infrastructure")
            if [ "$validate_only" = false ]; then
                deploy_infrastructure "$env_name" "$force_deploy"
            fi
            ;;
        "application")
            if [ "$validate_only" = false ]; then
                deploy_application_config "$env_name"
            fi
            ;;
        "settings")
            if [ "$validate_only" = false ]; then
                deploy_settings_config "$env_name"
            fi
            ;;
    esac
    
    # Validate deployment
    if [ "$validate_only" = false ]; then
        validate_deployment "$env_name"
    fi
    
    print_status "SUCCESS" "Configuration deployment to $env_name completed successfully"
    
    if [ -n "$backup_dir" ]; then
        print_status "INFO" "Backup available at: $backup_dir"
    fi
}

# Parse command line arguments
main() {
    local env_name=""
    local config_type="all"
    local force_deploy=false
    local validate_only=false
    local rollback=false
    local backup_dir=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--config-type)
                config_type="$2"
                shift 2
                ;;
            -f|--force)
                force_deploy=true
                shift
                ;;
            -r|--rollback)
                rollback=true
                shift
                ;;
            -v|--validate-only)
                validate_only=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            -*)
                print_status "ERROR" "Unknown option: $1"
                show_usage
                exit 1
                ;;
            *)
                if [ -z "$env_name" ]; then
                    env_name="$1"
                else
                    print_status "ERROR" "Multiple environments specified: $env_name and $1"
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Check if environment is specified
    if [ -z "$env_name" ]; then
        print_status "ERROR" "Environment must be specified"
        show_usage
        exit 1
    fi
    
    # Handle rollback
    if [ "$rollback" = true ]; then
        if [ -z "$backup_dir" ]; then
            print_status "ERROR" "Backup directory must be specified for rollback"
            exit 1
        fi
        rollback_configuration "$env_name" "$backup_dir"
        exit 0
    fi
    
    # Run deployment
    deploy_configuration "$env_name" "$config_type" "$force_deploy" "$validate_only"
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
