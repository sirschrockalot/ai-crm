#!/bin/bash

# Environment Configuration Validation Script
# This script validates that all required environment variables and configuration
# files are properly set up for the target environment.

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

# Function to validate environment file
validate_env_file() {
    local env_file=$1
    local env_name=$2
    
    print_status "INFO" "Validating $env_name environment file: $env_file"
    
    if [ ! -f "$env_file" ]; then
        print_status "ERROR" "Environment file $env_file not found"
        return 1
    fi
    
    # Check for required variables
    local required_vars=(
        "NEXT_PUBLIC_APP_NAME"
        "NEXT_PUBLIC_API_URL"
        "NEXT_PUBLIC_ENVIRONMENT"
        "NEXT_PUBLIC_FEATURE_FLAGS"
    )
    
    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$env_file"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_status "ERROR" "Missing required variables in $env_file: ${missing_vars[*]}"
        return 1
    fi
    
    print_status "SUCCESS" "$env_name environment file validation passed"
    return 0
}

# Function to validate settings configuration
validate_settings_config() {
    local env_name=$1
    local settings_file="src/frontend/config/settings.$env_name.json"
    
    print_status "INFO" "Validating $env_name settings configuration: $settings_file"
    
    if [ ! -f "$settings_file" ]; then
        print_status "ERROR" "Settings file $settings_file not found"
        return 1
    fi
    
    # Validate JSON syntax
    if ! jq empty "$settings_file" 2>/dev/null; then
        print_status "ERROR" "Invalid JSON syntax in $settings_file"
        return 1
    fi
    
    # Check for required settings sections
    local required_sections=("features" "security" "notifications" "ui")
    local missing_sections=()
    
    for section in "${required_sections[@]}"; do
        if ! jq -e ".$section" "$settings_file" >/dev/null 2>&1; then
            missing_sections+=("$section")
        fi
    done
    
    if [ ${#missing_sections[@]} -gt 0 ]; then
        print_status "ERROR" "Missing required sections in $settings_file: ${missing_sections[*]}"
        return 1
    fi
    
    print_status "SUCCESS" "$env_name settings configuration validation passed"
    return 0
}

# Function to validate Kubernetes configuration
validate_k8s_config() {
    local env_name=$1
    
    print_status "INFO" "Validating Kubernetes configuration for $env_name environment"
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        print_status "WARNING" "kubectl not found - skipping Kubernetes validation"
        return 0
    fi
    
    # Check if we can connect to the cluster
    if ! kubectl cluster-info &> /dev/null; then
        print_status "WARNING" "Cannot connect to Kubernetes cluster - skipping validation"
        return 0
    fi
    
    # Validate ConfigMaps
    local configmaps=("settings-config" "app-config" "feature-flags")
    for cm in "${configmaps[@]}"; do
        if kubectl get configmap "$cm" -n dealcycle-crm &> /dev/null; then
            print_status "SUCCESS" "ConfigMap $cm exists in dealcycle-crm namespace"
        else
            print_status "WARNING" "ConfigMap $cm not found in dealcycle-crm namespace"
        fi
    done
    
    return 0
}

# Function to validate infrastructure configuration
validate_infrastructure_config() {
    local env_name=$1
    
    print_status "INFO" "Validating infrastructure configuration for $env_name environment"
    
    # Check Terraform configuration
    if [ -d "infrastructure/terraform" ]; then
        cd infrastructure/terraform
        
        # Check if Terraform is available
        if command -v terraform &> /dev/null; then
            # Initialize Terraform
            if terraform init -backend=false &> /dev/null; then
                print_status "SUCCESS" "Terraform configuration is valid"
                
                # Validate with environment-specific variables
                if [ -f "environments/$env_name.tfvars" ]; then
                    if terraform validate -var-file="environments/$env_name.tfvars" &> /dev/null; then
                        print_status "SUCCESS" "Terraform configuration with $env_name variables is valid"
                    else
                        print_status "ERROR" "Terraform configuration with $env_name variables is invalid"
                        return 1
                    fi
                else
                    print_status "WARNING" "Environment-specific Terraform variables file not found: environments/$env_name.tfvars"
                fi
            else
                print_status "ERROR" "Terraform configuration is invalid"
                return 1
            fi
        else
            print_status "WARNING" "Terraform not found - skipping infrastructure validation"
        fi
        
        cd - > /dev/null
    else
        print_status "WARNING" "Terraform configuration directory not found"
    fi
    
    return 0
}

# Function to run comprehensive validation
run_validation() {
    local env_name=$1
    
    print_status "INFO" "Starting comprehensive validation for $env_name environment"
    echo
    
    local validation_passed=true
    
    # Validate environment file
    local env_file="src/frontend/env.$env_name"
    if ! validate_env_file "$env_file" "$env_name"; then
        validation_passed=false
    fi
    
    # Validate settings configuration
    if ! validate_settings_config "$env_name"; then
        validation_passed=false
    fi
    
    # Validate infrastructure configuration
    if ! validate_infrastructure_config "$env_name"; then
        validation_passed=false
    fi
    
    # Validate Kubernetes configuration
    if ! validate_k8s_config "$env_name"; then
        validation_passed=false
    fi
    
    echo
    
    if [ "$validation_passed" = true ]; then
        print_status "SUCCESS" "All validations passed for $env_name environment"
        return 0
    else
        print_status "ERROR" "Some validations failed for $env_name environment"
        return 1
    fi
}

# Main script execution
main() {
    local env_name=${1:-"development"}
    
    # Validate environment name
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
        exit 1
    fi
    
    print_status "INFO" "Environment Configuration Validation Tool"
    print_status "INFO" "Target Environment: $env_name"
    echo
    
    # Run validation
    if run_validation "$env_name"; then
        print_status "SUCCESS" "Environment validation completed successfully"
        exit 0
    else
        print_status "ERROR" "Environment validation completed with errors"
        exit 1
    fi
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
