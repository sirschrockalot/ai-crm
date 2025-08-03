# HashiCorp Vault Configuration for DealCycle CRM
# This configuration provides secure secrets management

storage "file" {
  path = "/vault/data"
}

listener "tcp" {
  address = "0.0.0.0:8200"
  tls_disable = 1  # Disable TLS for development
}

api_addr = "http://0.0.0.0:8200"
cluster_addr = "https://0.0.0.0:8201"

ui = true

# Enable audit logging for compliance
audit "file" {
  file_path = "/vault/logs/audit.log"
}

# Configure secrets engines
secrets {
  path "dealcycle/*" {
    capabilities = ["create", "read", "update", "delete", "list"]
  }
}

# Configure authentication methods
auth {
  path "userpass/*" {
    capabilities = ["create", "read", "update", "delete", "list"]
  }
}

# Configure policies
policy "dealcycle-admin" {
  rules = <<EOT
# Admin policy for DealCycle CRM
path "dealcycle/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "auth/userpass/users/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "sys/*" {
  capabilities = ["read"]
}
EOT
}

policy "dealcycle-app" {
  rules = <<EOT
# Application policy for DealCycle CRM
path "dealcycle/data/*" {
  capabilities = ["read"]
}

path "dealcycle/metadata/*" {
  capabilities = ["read"]
}
EOT
} 