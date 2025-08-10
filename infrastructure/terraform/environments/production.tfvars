# Production Environment Configuration
# This file contains production-specific values for Terraform variables

# Environment
environment = "production"

# Project Configuration
project_id = "dealcycle-crm-production"
region     = "us-central1"
zone       = "us-central1-a"

# Cluster Configuration
cluster_name = "dealcycle-production-cluster"
node_pool_machine_type = "e2-standard-4"
node_pool_disk_size_gb = 100
node_pool_min_count = 3
node_pool_max_count = 10

# Network Configuration
vpc_cidr = "10.2.0.0/16"
public_subnet_cidr = "10.2.1.0/24"
private_subnet_cidr = "10.2.2.0/24"
database_subnet_cidr = "10.2.3.0/24"

# Database Configuration
enable_cloud_sql = true  # Use Cloud SQL for production
enable_memorystore = true  # Use Cloud Memorystore for production

# Monitoring Configuration
enable_monitoring = true
enable_logging = true
enable_trace = true

# Security Configuration
enable_cloud_armor = true
enable_binary_authorization = true

# Cost Optimization
enable_spot_instances = false
enable_preemptible_nodes = false

# Backup Configuration
backup_retention_days = 30
backup_start_time = "01:00"

# Scaling Configuration
autoscaling_enabled = true
horizontal_pod_autoscaler_enabled = true
vertical_pod_autoscaler_enabled = true

# Resource Limits
cpu_request = "200m"
memory_request = "256Mi"
cpu_limit = "1000m"
memory_limit = "1Gi"

# Feature Flags
enable_ai_features = true
enable_automation = true
enable_analytics = true
enable_communications = true

# Production Features
enable_debug_mode = false
enable_development_tools = false
enable_test_data = false

# High Availability
enable_multi_zone = true
enable_regional_cluster = true
enable_node_auto_repair = true
enable_node_auto_upgrade = true

# Disaster Recovery
enable_cross_region_backup = true
enable_point_in_time_recovery = true
enable_automated_backups = true

# Performance Optimization
enable_network_policy = true
enable_pod_security_policy = true
enable_workload_identity = true

# Compliance
enable_audit_logging = true
enable_data_encryption = true
enable_vpc_service_controls = true
