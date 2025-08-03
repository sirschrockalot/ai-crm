# Terraform Configuration for DealCycle CRM Infrastructure
# This configuration provides infrastructure as code for the entire platform

terraform {
  required_version = ">= 1.0"
  
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }
  
  backend "gcs" {
    bucket = "dealcycle-crm-terraform-state"
    prefix = "terraform/state"
  }
}

# Configure Google Cloud Provider
provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

# Configure Kubernetes Provider
provider "kubernetes" {
  host                   = "https://${google_container_cluster.dealcycle_cluster.endpoint}"
  token                  = data.google_client_config.current.access_token
  cluster_ca_certificate = base64decode(google_container_cluster.dealcycle_cluster.master_auth[0].cluster_ca_certificate)
}

# Configure Helm Provider
provider "helm" {
  kubernetes {
    host                   = "https://${google_container_cluster.dealcycle_cluster.endpoint}"
    token                  = data.google_client_config.current.access_token
    cluster_ca_certificate = base64decode(google_container_cluster.dealcycle_cluster.master_auth[0].cluster_ca_certificate)
  }
}

# Get current Google client configuration
data "google_client_config" "current" {}

# Create VPC Network
resource "google_compute_network" "dealcycle_vpc" {
  name                    = "dealcycle-vpc"
  auto_create_subnetworks = false
  routing_mode            = "REGIONAL"
  mtu                     = 1460
}

# Create Public Subnet
resource "google_compute_subnetwork" "dealcycle_public_subnet" {
  name          = "dealcycle-public-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.dealcycle_vpc.id
  
  log_config {
    enable_flow_logs = true
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling = 0.5
    metadata = "INCLUDE_ALL_METADATA"
  }
}

# Create Private Subnet
resource "google_compute_subnetwork" "dealcycle_private_subnet" {
  name          = "dealcycle-private-subnet"
  ip_cidr_range = "10.0.2.0/24"
  region        = var.region
  network       = google_compute_network.dealcycle_vpc.id
  
  log_config {
    enable_flow_logs = true
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling = 0.5
    metadata = "INCLUDE_ALL_METADATA"
  }
}

# Create Database Subnet
resource "google_compute_subnetwork" "dealcycle_database_subnet" {
  name          = "dealcycle-database-subnet"
  ip_cidr_range = "10.0.3.0/24"
  region        = var.region
  network       = google_compute_network.dealcycle_vpc.id
  
  log_config {
    enable_flow_logs = true
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling = 1.0
    metadata = "INCLUDE_ALL_METADATA"
  }
}

# Create GKE Cluster
resource "google_container_cluster" "dealcycle_cluster" {
  name     = "dealcycle-cluster"
  location = var.region
  
  # Remove default node pool
  remove_default_node_pool = true
  initial_node_count       = 1
  
  network    = google_compute_network.dealcycle_vpc.name
  subnetwork = google_compute_subnetwork.dealcycle_private_subnet.name
  
  # Private cluster configuration
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
    master_ipv4_cidr_block = "172.16.0.0/28"
  }
  
  # Master authorized networks
  master_authorized_networks_config {
    cidr_blocks {
      cidr_block   = "10.0.0.0/8"
      display_name = "Corporate Network"
    }
    cidr_blocks {
      cidr_block   = "192.168.0.0/16"
      display_name = "VPN Network"
    }
  }
  
  # Workload identity
  workload_pool = "${var.project_id}.svc.id.goog"
  
  # Release channel
  release_channel {
    channel = "REGULAR"
  }
  
  # Network policy
  network_policy {
    enabled = true
    provider = "CALICO"
  }
  
  # Pod security policy
  pod_security_policy_config {
    enabled = true
  }
  
  # Maintenance policy
  maintenance_policy {
    recurring_window {
      start_time = "2024-01-01T02:00:00Z"
      end_time   = "2024-01-01T06:00:00Z"
    }
  }
}

# Create Node Pool for Backend
resource "google_container_node_pool" "dealcycle_backend_pool" {
  name       = "dealcycle-backend-pool"
  location   = var.region
  cluster    = google_container_cluster.dealcycle_cluster.name
  
  node_config {
    machine_type = "e2-highmem-4"
    disk_size_gb = 100
    disk_type    = "pd-ssd"
    image_type   = "COS_CONTAINERD"
    
    # Service account
    service_account = google_service_account.gke_node_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/devstorage.read_only"
    ]
    
    # Labels
    labels = {
      environment = var.environment
      workload    = "backend"
    }
    
    # Taints
    taint {
      key    = "workload"
      value  = "backend"
      effect = "NO_SCHEDULE"
    }
    
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
  
  # Autoscaling
  autoscaling {
    min_node_count = 2
    max_node_count = 10
    location_policy = "BALANCED"
  }
  
  # Management
  management {
    auto_repair  = true
    auto_upgrade = true
  }
  
  # Upgrade settings
  upgrade_settings {
    max_surge       = 1
    max_unavailable = 0
  }
}

# Create Node Pool for Frontend
resource "google_container_node_pool" "dealcycle_frontend_pool" {
  name       = "dealcycle-frontend-pool"
  location   = var.region
  cluster    = google_container_cluster.dealcycle_cluster.name
  
  node_config {
    machine_type = "e2-standard-2"
    disk_size_gb = 50
    disk_type    = "pd-standard"
    image_type   = "COS_CONTAINERD"
    
    # Service account
    service_account = google_service_account.gke_node_sa.email
    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/devstorage.read_only"
    ]
    
    # Labels
    labels = {
      environment = var.environment
      workload    = "frontend"
    }
    
    # Taints
    taint {
      key    = "workload"
      value  = "frontend"
      effect = "NO_SCHEDULE"
    }
    
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
  
  # Autoscaling
  autoscaling {
    min_node_count = 2
    max_node_count = 8
    location_policy = "BALANCED"
  }
  
  # Management
  management {
    auto_repair  = true
    auto_upgrade = true
  }
  
  # Upgrade settings
  upgrade_settings {
    max_surge       = 1
    max_unavailable = 0
  }
}

# Create Service Account for GKE Nodes
resource "google_service_account" "gke_node_sa" {
  account_id   = "gke-node-sa"
  display_name = "GKE Node Service Account"
}

# Grant necessary roles to the service account
resource "google_project_iam_member" "gke_node_sa_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.gke_node_sa.email}"
}

resource "google_project_iam_member" "gke_node_sa_monitoring" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.gke_node_sa.email}"
}

resource "google_project_iam_member" "gke_node_sa_storage" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.gke_node_sa.email}"
}

# Create Cloud Storage Bucket for Terraform State
resource "google_storage_bucket" "terraform_state" {
  name          = "dealcycle-crm-terraform-state"
  location      = var.region
  force_destroy = false
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}

# Create Cloud Storage Bucket for Application Data
resource "google_storage_bucket" "application_data" {
  name          = "dealcycle-crm-application-data"
  location      = var.region
  force_destroy = false
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

# Create Cloud SQL Instance for MongoDB (if needed)
resource "google_sql_database_instance" "dealcycle_mongodb" {
  count            = var.enable_cloud_sql ? 1 : 0
  name             = "dealcycle-mongodb-instance"
  database_version = "MYSQL_8_0"
  region           = var.region
  
  settings {
    tier = "db-f1-micro"
    
    backup_configuration {
      enabled    = true
      start_time = "02:00"
    }
    
    ip_configuration {
      ipv4_enabled    = false
      private_network = google_compute_network.dealcycle_vpc.id
    }
  }
  
  deletion_protection = false
}

# Create Cloud Memorystore for Redis
resource "google_redis_instance" "dealcycle_redis" {
  count          = var.enable_memorystore ? 1 : 0
  name           = "dealcycle-redis-instance"
  tier           = "BASIC"
  memory_size_gb = 1
  region         = var.region
  
  authorized_network = google_compute_network.dealcycle_vpc.id
  
  redis_configs = {
    maxmemory-policy = "allkeys-lru"
  }
}

# Create Cloud Armor Security Policy
resource "google_compute_security_policy" "dealcycle_security_policy" {
  name = "dealcycle-security-policy"
  
  adaptive_protection_config {
    layer_7_ddos_defense_config {
      enable = true
      rule_visibility = "STANDARD"
    }
    layer_7_ddos_rule_visibility = "STANDARD"
  }
  
  rule {
    action   = "rate-based-ban"
    priority = "1000"
    
    rate_limit_options {
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      enforce_on_key = "IP"
    }
    
    match {
      config {
        src_ip_ranges = ["*"]
      }
      versioned_expr = "SRC_IPS_V1"
    }
  }
  
  rule {
    action   = "deny(403)"
    priority = "2000"
    
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-stable')"
      }
    }
  }
  
  rule {
    action   = "deny(403)"
    priority = "3000"
    
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('xss-stable')"
      }
    }
  }
}

# Create Load Balancer
resource "google_compute_global_forwarding_rule" "dealcycle_lb" {
  name       = "dealcycle-load-balancer"
  target     = google_compute_target_http_proxy.dealcycle_http_proxy.id
  port_range = "80"
}

resource "google_compute_target_http_proxy" "dealcycle_http_proxy" {
  name    = "dealcycle-http-proxy"
  url_map = google_compute_url_map.dealcycle_url_map.id
}

resource "google_compute_url_map" "dealcycle_url_map" {
  name            = "dealcycle-url-map"
  default_service = google_compute_backend_service.dealcycle_backend.id
  
  host_rule {
    hosts        = ["*"]
    path_matcher = "allpaths"
  }
  
  path_matcher {
    name            = "allpaths"
    default_service = google_compute_backend_service.dealcycle_backend.id
  }
}

resource "google_compute_backend_service" "dealcycle_backend" {
  name        = "dealcycle-backend-service"
  protocol    = "HTTP"
  port_name   = "http"
  timeout_sec = 10
  
  backend {
    group = google_container_node_pool.dealcycle_backend_pool.instance_group_urls[0]
  }
  
  health_checks = [google_compute_health_check.dealcycle_health_check.id]
}

resource "google_compute_health_check" "dealcycle_health_check" {
  name = "dealcycle-health-check"
  
  http_health_check {
    port = 3000
  }
} 