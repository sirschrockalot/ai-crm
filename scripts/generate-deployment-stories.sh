#!/bin/bash

# Generate Deployment Story Files Script
# This script creates all the individual .md files for the broken-down deployment stories

STORY_DIR="docs/stories/deployment"

# Create the deployment stories directory if it doesn't exist
mkdir -p "$STORY_DIR"

# Function to create a story file
create_story_file() {
    local story_id=$1
    local title=$2
    local parent_story=$3
    local estimate=$4
    local risk_level=$5
    local description=$6
    
    local filename="$STORY_DIR/$story_id.md"
    
    cat > "$filename" << EOF
# $story_id: $title

## Story ID
$story_id

## Parent Story
$parent_story

## Epic
DEPLOY-001: Deploy Presidential Digs CRM to Google Cloud with Infrastructure as Code and CI/CD

## Title
$title

## User Story
$description

## Acceptance Criteria
- [ ] TBD - To be defined during story refinement

## Technical Details
- **TBD** - To be defined during story refinement

## Implementation Steps
1. **TBD** - To be defined during story refinement

## Definition of Done
- [ ] TBD - To be defined during story refinement

## Dependencies
- TBD - To be defined during story refinement

## Estimate
**$estimate**

## Risk Level
**$risk_level**

## Notes
- This story needs to be refined with the team
- Acceptance criteria should be defined during sprint planning
- Technical details should be specified based on requirements
- Dependencies should be identified and documented
EOF

    echo "Created: $filename"
}

# Create all the story files
echo "Generating deployment story files..."

# Story 1: Infrastructure as Code Foundation Setup
create_story_file "DEPLOY-001-01A" "Create Terraform project structure and basic configuration" "DEPLOY-001-01: Set up Infrastructure as Code foundation using Terraform" "1 day" "Low" "As a DevOps engineer, I want to establish a well-organized Terraform project structure so that infrastructure code is maintainable, scalable, and follows best practices."

create_story_file "DEPLOY-001-01B" "Configure Google Cloud provider and authentication" "DEPLOY-001-01: Set up Infrastructure as Code foundation using Terraform" "0.5 days" "Medium" "As a DevOps engineer, I want to configure the Google Cloud provider for Terraform so that I can authenticate and manage GCP resources through infrastructure as code."

create_story_file "DEPLOY-001-01C" "Set up Terraform state management" "DEPLOY-001-01: Set up Infrastructure as Code foundation using Terraform" "0.5 days" "Medium" "As a DevOps engineer, I want to configure remote state storage in Google Cloud Storage so that Terraform state is securely stored, versioned, and accessible to the team."

create_story_file "DEPLOY-001-01D" "Create basic Terraform modules structure" "DEPLOY-001-01: Set up Infrastructure as Code foundation using Terraform" "1 day" "Low" "As a DevOps engineer, I want to create a modular Terraform structure so that infrastructure components can be reused, maintained, and tested independently."

# Story 2: Google Cloud Project and Billing Setup
create_story_file "DEPLOY-001-02A" "Create and configure GCP project" "DEPLOY-001-02: Configure Google Cloud project and billing for Presidential Digs CRM" "0.5 days" "Low" "As a DevOps engineer, I want to create a dedicated Google Cloud project so that all CRM infrastructure costs and resources are properly organized and managed."

create_story_file "DEPLOY-001-02B" "Set up billing and cost monitoring" "DEPLOY-001-02: Configure Google Cloud project and billing for Presidential Digs CRM" "1 day" "Medium" "As a DevOps engineer, I want to configure billing and cost monitoring so that infrastructure costs are tracked, monitored, and optimized."

create_story_file "DEPLOY-001-02C" "Configure project quotas and limits" "DEPLOY-001-02: Configure Google Cloud project and billing for Presidential Digs CRM" "0.5 days" "Low" "As a DevOps engineer, I want to configure project quotas and limits so that resource usage is controlled and predictable."

create_story_file "DEPLOY-001-02D" "Establish resource naming conventions" "DEPLOY-001-02: Configure Google Cloud project and billing for Presidential Digs CRM" "0.5 days" "Low" "As a DevOps engineer, I want to establish resource naming conventions so that all GCP resources are consistently labeled and easily identifiable."

# Story 3: Network Infrastructure Setup
create_story_file "DEPLOY-001-03A" "Create VPC and subnet structure" "DEPLOY-001-03: Create secure VPC network infrastructure for CRM services" "1 day" "Medium" "As a DevOps engineer, I want to create VPC and subnet structure so that all CRM services have proper network segmentation and routing."

create_story_file "DEPLOY-001-03B" "Configure firewall rules and security" "DEPLOY-001-03: Create secure VPC network infrastructure for CRM services" "1 day" "High" "As a DevOps engineer, I want to configure firewall rules and security policies so that network traffic is properly controlled and secured."

create_story_file "DEPLOY-001-03C" "Set up Cloud NAT and internet access" "DEPLOY-001-03: Create secure VPC network infrastructure for CRM services" "0.5 days" "Medium" "As a DevOps engineer, I want to set up Cloud NAT and internet access so that private instances can securely access external resources."

create_story_file "DEPLOY-001-03D" "Implement network security best practices" "DEPLOY-001-03: Create secure VPC network infrastructure for CRM services" "0.5 days" "Medium" "As a DevOps engineer, I want to implement network security best practices so that the network infrastructure follows security standards and compliance requirements."

# Story 4: Container Registry and Image Management
create_story_file "DEPLOY-001-04A" "Enable and configure Container Registry" "DEPLOY-001-04: Set up Google Container Registry for Docker image management" "0.5 days" "Low" "As a DevOps engineer, I want to enable and configure Container Registry so that Docker images can be stored and managed in Google Cloud."

create_story_file "DEPLOY-001-04B" "Configure service account permissions" "DEPLOY-001-04: Set up Google Container Registry for Docker image management" "0.5 days" "Medium" "As a DevOps engineer, I want to configure service account permissions so that CI/CD pipelines can securely push and pull images."

create_story_file "DEPLOY-001-04C" "Set up image scanning and security" "DEPLOY-001-04: Set up Google Container Registry for Docker image management" "1 day" "Medium" "As a DevOps engineer, I want to set up image scanning and security so that container images are scanned for vulnerabilities before deployment."

create_story_file "DEPLOY-001-04D" "Implement image lifecycle management" "DEPLOY-001-04: Set up Google Container Registry for Docker image management" "0.5 days" "Low" "As a DevOps engineer, I want to implement image lifecycle management so that old and unused images are automatically cleaned up to optimize storage costs."

# Story 5: Kubernetes Cluster Setup
create_story_file "DEPLOY-001-05A" "Design and plan GKE cluster architecture" "DEPLOY-001-05: Deploy Google Kubernetes Engine cluster for CRM services" "1 day" "Medium" "As a DevOps engineer, I want to design and plan the GKE cluster architecture so that the cluster meets performance, scalability, and security requirements."

create_story_file "DEPLOY-001-05B" "Deploy GKE cluster with Terraform" "DEPLOY-001-05: Deploy Google Kubernetes Engine cluster for CRM services" "1 day" "High" "As a DevOps engineer, I want to deploy the GKE cluster using Terraform so that the cluster is created consistently and can be version controlled."

create_story_file "DEPLOY-001-05C" "Configure node pools and autoscaling" "DEPLOY-001-05: Deploy Google Kubernetes Engine cluster for CRM services" "1 day" "Medium" "As a DevOps engineer, I want to configure node pools and autoscaling so that the cluster can efficiently handle varying workloads and optimize resource usage."

create_story_file "DEPLOY-001-05D" "Implement cluster security and monitoring" "DEPLOY-001-05: Deploy Google Kubernetes Engine cluster for CRM services" "1 day" "High" "As a DevOps engineer, I want to implement cluster security and monitoring so that the cluster is secure, compliant, and observable."

# Story 6: CI/CD Pipeline Foundation
create_story_file "DEPLOY-001-06A" "Set up GitHub Actions environment" "DEPLOY-001-06: Establish GitHub Actions CI/CD pipeline foundation" "0.5 days" "Low" "As a DevOps engineer, I want to set up the GitHub Actions environment so that CI/CD workflows can be configured and executed."

create_story_file "DEPLOY-001-06B" "Create build and test workflows" "DEPLOY-001-06: Establish GitHub Actions CI/CD pipeline foundation" "1 day" "Medium" "As a DevOps engineer, I want to create build and test workflows so that code changes automatically trigger builds and tests."

create_story_file "DEPLOY-001-06C" "Implement Docker image building" "DEPLOY-001-06: Establish GitHub Actions CI/CD pipeline foundation" "1 day" "Medium" "As a DevOps engineer, I want to implement Docker image building so that application images are automatically built and optimized for deployment."

create_story_file "DEPLOY-001-06D" "Set up image registry integration" "DEPLOY-001-06: Establish GitHub Actions CI/CD pipeline foundation" "0.5 days" "Medium" "As a DevOps engineer, I want to set up image registry integration so that built images are automatically pushed to the container registry."

# Story 7: Authentication Service Deployment
create_story_file "DEPLOY-001-07A" "Create Kubernetes manifests" "DEPLOY-001-07: Deploy authentication service to Google Cloud" "1 day" "Medium" "As a DevOps engineer, I want to create Kubernetes manifests so that the authentication service can be deployed to the GKE cluster."

create_story_file "DEPLOY-001-07B" "Configure environment and secrets" "DEPLOY-001-07: Deploy authentication service to Google Cloud" "0.5 days" "Medium" "As a DevOps engineer, I want to configure environment variables and secrets so that the authentication service has proper configuration and secure access to sensitive data."

create_story_file "DEPLOY-001-07C" "Deploy and test service" "DEPLOY-001-07: Deploy authentication service to Google Cloud" "0.5 days" "Medium" "As a DevOps engineer, I want to deploy and test the authentication service so that it is running correctly and accessible in the cloud environment."

create_story_file "DEPLOY-001-07D" "Configure monitoring and scaling" "DEPLOY-001-07: Deploy authentication service to Google Cloud" "0.5 days" "Low" "As a DevOps engineer, I want to configure monitoring and scaling so that the authentication service is observable and can handle varying loads."

# Story 8: Lead Import Service Deployment
create_story_file "DEPLOY-001-08A" "Create Kubernetes manifests" "DEPLOY-001-08: Deploy lead import service to Google Cloud" "1 day" "Medium" "As a DevOps engineer, I want to create Kubernetes manifests so that the lead import service can be deployed to the GKE cluster."

create_story_file "DEPLOY-001-08B" "Configure environment and database" "DEPLOY-001-08: Deploy lead import service to Google Cloud" "0.5 days" "Medium" "As a DevOps engineer, I want to configure environment variables and database connections so that the lead import service can properly process and store lead data."

create_story_file "DEPLOY-001-08C" "Deploy and test service" "DEPLOY-001-08: Deploy lead import service to Google Cloud" "0.5 days" "Medium" "As a DevOps engineer, I want to deploy and test the lead import service so that it is running correctly and can process lead imports."

create_story_file "DEPLOY-001-08D" "Configure monitoring and scaling" "DEPLOY-001-08: Deploy lead import service to Google Cloud" "0.5 days" "Low" "As a DevOps engineer, I want to configure monitoring and scaling so that the lead import service is observable and can handle varying import workloads."

# Story 9: Frontend Application Deployment
create_story_file "DEPLOY-001-09A" "Choose deployment platform and configure" "DEPLOY-001-09: Deploy frontend application to Google Cloud" "1 day" "Medium" "As a DevOps engineer, I want to choose and configure the appropriate deployment platform so that the frontend application is deployed efficiently and cost-effectively."

create_story_file "DEPLOY-001-09B" "Set up custom domain and SSL" "DEPLOY-001-09: Deploy frontend application to Google Cloud" "1 day" "Medium" "As a DevOps engineer, I want to set up custom domain and SSL so that users can access the CRM application securely through a professional domain."

create_story_file "DEPLOY-001-09C" "Configure CDN and static assets" "DEPLOY-001-09: Deploy frontend application to Google Cloud" "0.5 days" "Low" "As a DevOps engineer, I want to configure CDN and static assets so that the frontend application loads quickly and efficiently for users."

create_story_file "DEPLOY-001-09D" "Deploy and test frontend" "DEPLOY-001-09: Deploy frontend application to Google Cloud" "0.5 days" "Medium" "As a DevOps engineer, I want to deploy and test the frontend application so that it is accessible and functioning correctly in the cloud environment."

# Story 10: Service Discovery and Load Balancing
create_story_file "DEPLOY-001-10A" "Configure Kubernetes service discovery" "DEPLOY-001-10: Configure service discovery and load balancing for microservices" "1 day" "Medium" "As a DevOps engineer, I want to configure Kubernetes service discovery so that all CRM microservices can communicate with each other effectively."

create_story_file "DEPLOY-001-10B" "Set up external load balancers" "DEPLOY-001-10: Configure service discovery and load balancing for microservices" "1 day" "Medium" "As a DevOps engineer, I want to set up external load balancers so that incoming traffic is distributed efficiently across CRM services."

create_story_file "DEPLOY-001-10C" "Implement ingress routing" "DEPLOY-001-10: Configure service discovery and load balancing for microservices" "1 day" "Medium" "As a DevOps engineer, I want to implement ingress routing so that traffic is properly routed to different services based on URL paths and rules."

create_story_file "DEPLOY-001-10D" "Configure monitoring and health checks" "DEPLOY-001-10: Configure service discovery and load balancing for microservices" "0.5 days" "Low" "As a DevOps engineer, I want to configure monitoring and health checks so that load balancer performance and service health are continuously monitored."

# Story 11: Monitoring and Alerting Setup
create_story_file "DEPLOY-001-11A" "Set up Google Cloud Monitoring" "DEPLOY-001-11: Configure comprehensive monitoring and alerting for CRM services" "0.5 days" "Low" "As a DevOps engineer, I want to set up Google Cloud Monitoring so that infrastructure and application metrics are collected and available for analysis."

create_story_file "DEPLOY-001-11B" "Create custom dashboards" "DEPLOY-001-11: Configure comprehensive monitoring and alerting for CRM services" "1 day" "Medium" "As a DevOps engineer, I want to create custom dashboards so that team members can easily monitor CRM service performance and health."

create_story_file "DEPLOY-001-11C" "Configure alerting policies" "DEPLOY-001-11: Configure comprehensive monitoring and alerting for CRM services" "1 day" "Medium" "As a DevOps engineer, I want to configure alerting policies so that the team is notified immediately when critical issues occur."

create_story_file "DEPLOY-001-11D" "Set up log aggregation" "DEPLOY-001-11: Configure comprehensive monitoring and alerting for CRM services" "0.5 days" "Low" "As a DevOps engineer, I want to set up log aggregation so that logs from all CRM services are collected, searchable, and analyzable."

# Story 12: Security and Compliance Configuration
create_story_file "DEPLOY-001-12A" "Configure IAM and access controls" "DEPLOY-001-12: Implement security and compliance measures for production deployment" "1 day" "High" "As a DevOps engineer, I want to configure IAM and access controls so that only authorized users and services can access CRM infrastructure and resources."

create_story_file "DEPLOY-001-12B" "Implement network security" "DEPLOY-001-12: Implement security and compliance measures for production deployment" "1 day" "High" "As a DevOps engineer, I want to implement network security so that all network traffic is properly secured and follows security best practices."

create_story_file "DEPLOY-001-12C" "Set up secrets management" "DEPLOY-001-12: Implement security and compliance measures for production deployment" "1 day" "High" "As a DevOps engineer, I want to set up secrets management so that sensitive data like API keys and passwords are securely stored and managed."

create_story_file "DEPLOY-001-12D" "Configure security scanning" "DEPLOY-001-12: Implement security and compliance measures for production deployment" "0.5 days" "Medium" "As a DevOps engineer, I want to configure security scanning so that vulnerabilities are automatically detected and reported."

# Story 13: Disaster Recovery and Backup
create_story_file "DEPLOY-001-13A" "Design backup strategy" "DEPLOY-001-13: Implement disaster recovery and backup procedures" "1 day" "Medium" "As a DevOps engineer, I want to design a comprehensive backup strategy so that CRM data and configurations can be recovered in case of disasters."

create_story_file "DEPLOY-001-13B" "Implement automated backup" "DEPLOY-001-13: Implement disaster recovery and backup procedures" "1 day" "Medium" "As a DevOps engineer, I want to implement automated backup procedures so that backups are created regularly without manual intervention."

create_story_file "DEPLOY-001-13C" "Create recovery procedures" "DEPLOY-001-13: Implement disaster recovery and backup procedures" "1 day" "High" "As a DevOps engineer, I want to create recovery procedures so that the team knows exactly how to restore services in case of failures."

create_story_file "DEPLOY-001-13D" "Test disaster recovery" "DEPLOY-001-13: Implement disaster recovery and backup procedures" "1 day" "High" "As a DevOps engineer, I want to test disaster recovery procedures so that the team is confident in their ability to restore services quickly."

# Story 14: Performance Optimization and Scaling
create_story_file "DEPLOY-001-14A" "Configure auto-scaling policies" "DEPLOY-001-14: Optimize performance and implement auto-scaling for CRM services" "1 day" "Medium" "As a DevOps engineer, I want to configure auto-scaling policies so that CRM services can automatically scale up or down based on demand."

create_story_file "DEPLOY-001-14B" "Optimize resource allocation" "DEPLOY-001-14: Optimize performance and implement auto-scaling for CRM services" "1 day" "Medium" "As a DevOps engineer, I want to optimize resource allocation so that CRM services use resources efficiently and cost-effectively."

create_story_file "DEPLOY-001-14C" "Implement performance monitoring" "DEPLOY-001-14: Optimize performance and implement auto-scaling for CRM services" "0.5 days" "Low" "As a DevOps engineer, I want to implement performance monitoring so that service performance can be continuously tracked and optimized."

create_story_file "DEPLOY-001-14D" "Optimize costs" "DEPLOY-001-14: Optimize performance and implement auto-scaling for CRM services" "0.5 days" "Low" "As a DevOps engineer, I want to optimize costs so that infrastructure costs are minimized while maintaining performance requirements."

# Story 15: Production Deployment and Go-Live
create_story_file "DEPLOY-001-15A" "Prepare production environment" "DEPLOY-001-15: Execute production deployment and go-live for Presidential Digs CRM" "1 day" "High" "As a DevOps engineer, I want to prepare the production environment so that it is ready for the final deployment and go-live."

create_story_file "DEPLOY-001-15B" "Execute production deployment" "DEPLOY-001-15: Execute production deployment and go-live for Presidential Digs CRM" "1 day" "High" "As a DevOps engineer, I want to execute the production deployment so that all CRM services are successfully deployed to production."

create_story_file "DEPLOY-001-15C" "Set up production support" "DEPLOY-001-15: Execute production deployment and go-live for Presidential Digs CRM" "1 day" "Medium" "As a DevOps engineer, I want to set up production support so that the team is ready to handle production issues and user support."

create_story_file "DEPLOY-001-15D" "Conduct go-live activities" "DEPLOY-001-15: Execute production deployment and go-live for Presidential Digs CRM" "0.5 days" "High" "As a DevOps engineer, I want to conduct go-live activities so that the CRM application is successfully launched and available to users."

# Story 16: Post-Deployment Optimization and Maintenance
create_story_file "DEPLOY-001-16A" "Establish monitoring and optimization processes" "DEPLOY-001-16: Optimize and maintain production deployment" "1 day" "Low" "As a DevOps engineer, I want to establish monitoring and optimization processes so that the production environment continues to perform optimally."

create_story_file "DEPLOY-001-16B" "Implement maintenance procedures" "DEPLOY-001-16: Optimize and maintain production deployment" "1 day" "Medium" "As a DevOps engineer, I want to implement maintenance procedures so that regular updates and maintenance can be performed efficiently."

create_story_file "DEPLOY-001-16C" "Set up continuous improvement" "DEPLOY-001-16: Optimize and maintain production deployment" "0.5 days" "Low" "As a DevOps engineer, I want to set up continuous improvement processes so that the team can continuously learn and improve deployment practices."

create_story_file "DEPLOY-001-16D" "Train and develop team" "DEPLOY-001-16: Optimize and maintain production deployment" "0.5 days" "Low" "As a DevOps engineer, I want to train and develop the team so that everyone has the skills needed to maintain and optimize the production environment."

echo "All deployment story files have been generated!"
echo "Total files created: 64"
echo "Location: $STORY_DIR"
echo ""
echo "Next steps:"
echo "1. Review and refine each story with the team"
echo "2. Add specific acceptance criteria and technical details"
echo "3. Update dependencies and estimates as needed"
echo "4. Move stories to your project management system"
