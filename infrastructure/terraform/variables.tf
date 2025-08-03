# Terraform Variables for DealCycle CRM Infrastructure

variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
  default     = "dealcycle-crm"
}

variable "region" {
  description = "Google Cloud Region"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Google Cloud Zone"
  type        = string
  default     = "us-central1-a"
}

variable "environment" {
  description = "Environment (development, staging, production)"
  type        = string
  default     = "development"
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be one of: development, staging, production."
  }
}

variable "enable_cloud_sql" {
  description = "Enable Cloud SQL for MongoDB"
  type        = bool
  default     = false
}

variable "enable_memorystore" {
  description = "Enable Cloud Memorystore for Redis"
  type        = bool
  default     = false
}

variable "cluster_name" {
  description = "GKE Cluster Name"
  type        = string
  default     = "dealcycle-cluster"
}

variable "node_pool_machine_type" {
  description = "Machine type for GKE node pools"
  type        = string
  default     = "e2-standard-2"
}

variable "node_pool_disk_size_gb" {
  description = "Disk size in GB for GKE node pools"
  type        = number
  default     = 50
}

variable "node_pool_min_count" {
  description = "Minimum number of nodes in GKE node pools"
  type        = number
  default     = 2
}

variable "node_pool_max_count" {
  description = "Maximum number of nodes in GKE node pools"
  type        = number
  default     = 10
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "private_subnet_cidr" {
  description = "CIDR block for private subnet"
  type        = string
  default     = "10.0.2.0/24"
}

variable "database_subnet_cidr" {
  description = "CIDR block for database subnet"
  type        = string
  default     = "10.0.3.0/24"
}

variable "master_authorized_networks" {
  description = "List of CIDR blocks authorized to access GKE master"
  type        = list(object({
    cidr_block   = string
    display_name = string
  }))
  default = [
    {
      cidr_block   = "10.0.0.0/8"
      display_name = "Corporate Network"
    },
    {
      cidr_block   = "192.168.0.0/16"
      display_name = "VPN Network"
    }
  ]
}

variable "enable_network_policy" {
  description = "Enable network policy for GKE cluster"
  type        = bool
  default     = true
}

variable "enable_pod_security_policy" {
  description = "Enable pod security policy for GKE cluster"
  type        = bool
  default     = true
}

variable "enable_workload_identity" {
  description = "Enable workload identity for GKE cluster"
  type        = bool
  default     = true
}

variable "maintenance_window_start" {
  description = "Start time for GKE maintenance window"
  type        = string
  default     = "2024-01-01T02:00:00Z"
}

variable "maintenance_window_end" {
  description = "End time for GKE maintenance window"
  type        = string
  default     = "2024-01-01T06:00:00Z"
}

variable "enable_auto_repair" {
  description = "Enable auto repair for GKE node pools"
  type        = bool
  default     = true
}

variable "enable_auto_upgrade" {
  description = "Enable auto upgrade for GKE node pools"
  type        = bool
  default     = true
}

variable "max_surge" {
  description = "Maximum surge for GKE node pool upgrades"
  type        = number
  default     = 1
}

variable "max_unavailable" {
  description = "Maximum unavailable for GKE node pool upgrades"
  type        = number
  default     = 0
}

variable "backup_enabled" {
  description = "Enable backup for Cloud SQL"
  type        = bool
  default     = true
}

variable "backup_start_time" {
  description = "Start time for Cloud SQL backup"
  type        = string
  default     = "02:00"
}

variable "redis_memory_size_gb" {
  description = "Memory size in GB for Redis instance"
  type        = number
  default     = 1
}

variable "redis_tier" {
  description = "Tier for Redis instance"
  type        = string
  default     = "BASIC"
  
  validation {
    condition     = contains(["BASIC", "STANDARD_HA"], var.redis_tier)
    error_message = "Redis tier must be one of: BASIC, STANDARD_HA."
  }
}

variable "security_policy_rules" {
  description = "Security policy rules for Cloud Armor"
  type = list(object({
    priority = number
    action   = string
    match = object({
      expr = object({
        expression = string
      })
    })
  }))
  default = [
    {
      priority = 1000
      action   = "rate-based-ban"
      match = {
        expr = {
          expression = "true"
        }
      }
    },
    {
      priority = 2000
      action   = "deny(403)"
      match = {
        expr = {
          expression = "evaluatePreconfiguredExpr('sqli-stable')"
        }
      }
    },
    {
      priority = 3000
      action   = "deny(403)"
      match = {
        expr = {
          expression = "evaluatePreconfiguredExpr('xss-stable')"
        }
      }
    }
  ]
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default = {
    project     = "dealcycle-crm"
    environment = "development"
    managed_by  = "terraform"
  }
} 