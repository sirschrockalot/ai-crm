# Terraform Outputs for DealCycle CRM Infrastructure

output "project_id" {
  description = "Google Cloud Project ID"
  value       = var.project_id
}

output "region" {
  description = "Google Cloud Region"
  value       = var.region
}

output "zone" {
  description = "Google Cloud Zone"
  value       = var.zone
}

output "environment" {
  description = "Environment"
  value       = var.environment
}

output "vpc_name" {
  description = "VPC Name"
  value       = google_compute_network.dealcycle_vpc.name
}

output "vpc_id" {
  description = "VPC ID"
  value       = google_compute_network.dealcycle_vpc.id
}

output "public_subnet_name" {
  description = "Public Subnet Name"
  value       = google_compute_subnetwork.dealcycle_public_subnet.name
}

output "public_subnet_id" {
  description = "Public Subnet ID"
  value       = google_compute_subnetwork.dealcycle_public_subnet.id
}

output "private_subnet_name" {
  description = "Private Subnet Name"
  value       = google_compute_subnetwork.dealcycle_private_subnet.name
}

output "private_subnet_id" {
  description = "Private Subnet ID"
  value       = google_compute_subnetwork.dealcycle_private_subnet.id
}

output "database_subnet_name" {
  description = "Database Subnet Name"
  value       = google_compute_subnetwork.dealcycle_database_subnet.name
}

output "database_subnet_id" {
  description = "Database Subnet ID"
  value       = google_compute_subnetwork.dealcycle_database_subnet.id
}

output "gke_cluster_name" {
  description = "GKE Cluster Name"
  value       = google_container_cluster.dealcycle_cluster.name
}

output "gke_cluster_endpoint" {
  description = "GKE Cluster Endpoint"
  value       = google_container_cluster.dealcycle_cluster.endpoint
}

output "gke_cluster_location" {
  description = "GKE Cluster Location"
  value       = google_container_cluster.dealcycle_cluster.location
}

output "gke_cluster_master_version" {
  description = "GKE Cluster Master Version"
  value       = google_container_cluster.dealcycle_cluster.master_version
}

output "gke_cluster_node_count" {
  description = "GKE Cluster Node Count"
  value       = google_container_cluster.dealcycle_cluster.node_count
}

output "backend_node_pool_name" {
  description = "Backend Node Pool Name"
  value       = google_container_node_pool.dealcycle_backend_pool.name
}

output "frontend_node_pool_name" {
  description = "Frontend Node Pool Name"
  value       = google_container_node_pool.dealcycle_frontend_pool.name
}

output "service_account_email" {
  description = "GKE Node Service Account Email"
  value       = google_service_account.gke_node_sa.email
}

output "terraform_state_bucket" {
  description = "Terraform State Bucket Name"
  value       = google_storage_bucket.terraform_state.name
}

output "application_data_bucket" {
  description = "Application Data Bucket Name"
  value       = google_storage_bucket.application_data.name
}

output "cloud_sql_instance_name" {
  description = "Cloud SQL Instance Name"
  value       = var.enable_cloud_sql ? google_sql_database_instance.dealcycle_mongodb[0].name : null
}

output "redis_instance_name" {
  description = "Redis Instance Name"
  value       = var.enable_memorystore ? google_redis_instance.dealcycle_redis[0].name : null
}

output "security_policy_name" {
  description = "Cloud Armor Security Policy Name"
  value       = google_compute_security_policy.dealcycle_security_policy.name
}

output "load_balancer_ip" {
  description = "Load Balancer IP Address"
  value       = google_compute_global_forwarding_rule.dealcycle_lb.ip_address
}

output "load_balancer_name" {
  description = "Load Balancer Name"
  value       = google_compute_global_forwarding_rule.dealcycle_lb.name
}

output "kubeconfig_command" {
  description = "Command to configure kubectl"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.dealcycle_cluster.name} --region ${google_container_cluster.dealcycle_cluster.location} --project ${var.project_id}"
}

output "cluster_info" {
  description = "Cluster Information"
  value = {
    name     = google_container_cluster.dealcycle_cluster.name
    location = google_container_cluster.dealcycle_cluster.location
    endpoint = google_container_cluster.dealcycle_cluster.endpoint
    version  = google_container_cluster.dealcycle_cluster.master_version
  }
}

output "network_info" {
  description = "Network Information"
  value = {
    vpc_name           = google_compute_network.dealcycle_vpc.name
    public_subnet_name = google_compute_subnetwork.dealcycle_public_subnet.name
    private_subnet_name = google_compute_subnetwork.dealcycle_private_subnet.name
    database_subnet_name = google_compute_subnetwork.dealcycle_database_subnet.name
  }
}

output "storage_info" {
  description = "Storage Information"
  value = {
    terraform_state_bucket = google_storage_bucket.terraform_state.name
    application_data_bucket = google_storage_bucket.application_data.name
  }
}

output "security_info" {
  description = "Security Information"
  value = {
    security_policy_name = google_compute_security_policy.dealcycle_security_policy.name
    service_account_email = google_service_account.gke_node_sa.email
  }
}

output "monitoring_endpoints" {
  description = "Monitoring Endpoints"
  value = {
    prometheus = "http://${google_container_cluster.dealcycle_cluster.endpoint}/api/v1/namespaces/monitoring/services/prometheus-k8s:web/proxy/"
    grafana    = "http://${google_container_cluster.dealcycle_cluster.endpoint}/api/v1/namespaces/monitoring/services/grafana:http/proxy/"
  }
}

output "deployment_instructions" {
  description = "Deployment Instructions"
  value = <<-EOT
    # DealCycle CRM Infrastructure Deployment Instructions
    
    ## Prerequisites
    1. Install Google Cloud SDK
    2. Install kubectl
    3. Install helm
    4. Install terraform
    
    ## Authentication
    gcloud auth application-default login
    gcloud config set project ${var.project_id}
    
    ## Deploy Infrastructure
    cd infrastructure/terraform
    terraform init
    terraform plan
    terraform apply
    
    ## Configure kubectl
    ${google_container_cluster.dealcycle_cluster.name != "" ? "gcloud container clusters get-credentials ${google_container_cluster.dealcycle_cluster.name} --region ${google_container_cluster.dealcycle_cluster.location} --project ${var.project_id}" : "echo 'Cluster not created yet'"}
    
    ## Deploy Applications
    kubectl apply -f ../kubernetes/
    
    ## Access Services
    - Frontend: http://${google_compute_global_forwarding_rule.dealcycle_lb.ip_address}
    - Backend API: http://${google_compute_global_forwarding_rule.dealcycle_lb.ip_address}/api
    - Monitoring: http://${google_container_cluster.dealcycle_cluster.endpoint}/api/v1/namespaces/monitoring/services/prometheus-k8s:web/proxy/
    
    ## Cleanup
    terraform destroy
  EOT
} 