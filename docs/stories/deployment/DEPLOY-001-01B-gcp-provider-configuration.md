# DEPLOY-001-01B: Configure Google Cloud Provider and Authentication

## Story ID
DEPLOY-001-01B

## Parent Story
DEPLOY-001-01: Set up Infrastructure as Code foundation using Terraform

## Epic
DEPLOY-001: Deploy Presidential Digs CRM to Google Cloud with Infrastructure as Code and CI/CD

## Title
Configure Google Cloud provider and authentication

## User Story
As a DevOps engineer, I want to configure the Google Cloud provider for Terraform so that I can authenticate and manage GCP resources through infrastructure as code.

## Acceptance Criteria
- [ ] Google Cloud provider is properly configured in Terraform
- [ ] Service account for Terraform is created with appropriate permissions
- [ ] Authentication credentials are securely configured
- [ ] Provider connectivity is tested and verified
- [ ] Provider configuration follows security best practices

## Technical Details
- **Provider**: Google Cloud Provider for Terraform
- **Authentication**: Service Account with JSON key or Application Default Credentials
- **Permissions**: Required IAM roles for Terraform operations
- **Security**: Secure credential management
- **Testing**: Provider connectivity verification

## Implementation Steps
1. **Create service account for Terraform**
   - Create dedicated service account: `terraform-deployer`
   - Assign minimal required IAM roles:
     - `roles/editor` (or more restrictive custom roles)
     - `roles/iam.serviceAccountAdmin`
     - `roles/resourcemanager.projectIamAdmin`

2. **Generate and secure authentication credentials**
   - Create JSON key for service account
   - Store credentials securely (not in version control)
   - Set up environment variables or credential files

3. **Configure Terraform provider**
   - Update `providers.tf` with Google Cloud provider configuration
   - Set project ID and region
   - Configure authentication method

4. **Test provider connectivity**
   - Run `terraform init` to download provider
   - Test basic provider functionality
   - Verify authentication is working

## Definition of Done
- [ ] Service account is created with appropriate permissions
- [ ] Authentication credentials are securely configured
- [ ] Terraform provider is properly configured
- [ ] Provider connectivity is verified
- [ ] Security review is completed
- [ ] Documentation is updated

## Dependencies
- DEPLOY-001-01A: Create Terraform project structure and basic configuration
- DEPLOY-001-02A: Create and configure GCP project

## Estimate
**0.5 days**

## Risk Level
**Medium** - Involves IAM configuration and credential management

## Security Considerations
- Use least privilege principle for service account permissions
- Secure credential storage (avoid committing to version control)
- Consider using Workload Identity for production environments
- Regularly rotate service account keys

## Notes
- Ensure service account has only the minimum required permissions
- Consider using Application Default Credentials for local development
- Document the authentication method used for team reference
- Plan for credential rotation and management
