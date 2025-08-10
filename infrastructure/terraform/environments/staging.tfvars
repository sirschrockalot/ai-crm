# Staging Environment Configuration
# This file contains staging-specific values for Terraform variables

# Environment
environment = "staging"

# Project Configuration
project_id = "dealcycle-crm-staging"
region     = "us-central1"
zone       = "us-central1-a"

# Cluster Configuration
cluster_name = "dealcycle-staging-cluster"
node_pool_machine_type = "e2-standard-2"
node_pool_disk_size_gb = 50
node_pool_min_count = 2
node_pool_max_count = 5

# Network Configuration
vpc_cidr = "10.1.0.0/16"
public_subnet_cidr = "10.1.1.0/24"
private_subnet_cidr = "10.1.2.0/24"
database_subnet_cidr = "10.1.3.0/24"

# Database Configuration
enable_cloud_sql = false  # Use local MongoDB for staging
enable_memorystore = false  # Use local Redis for staging

# Monitoring Configuration
enable_monitoring = true
enable_logging = true
enable_trace = false

# Security Configuration
enable_cloud_armor = false
enable_binary_authorization = false

# Cost Optimization
enable_spot_instances = true
enable_preemptible_nodes = true

# Backup Configuration
backup_retention_days = 7
backup_start_time = "02:00"

# Scaling Configuration
autoscaling_enabled = true
horizontal_pod_autoscaler_enabled = true
vertical_pod_autoscaler_enabled = false

# Resource Limits
cpu_request = "100m"
memory_request = "128Mi"
cpu_limit = "500m"
memory_limit = "512Mi"

# Feature Flags
enable_ai_features = true
enable_automation = true
enable_analytics = true
enable_communications = true

# Development Features
enable_debug_mode = true
enable_development_tools = true
enable_test_data = true
