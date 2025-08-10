# Configuration Deployment Rollback Guide

## Overview
This document provides comprehensive instructions for rolling back configuration deployments in the DealCycle CRM system. Rollbacks can be performed at multiple levels depending on the scope and impact of the deployment issue.

## Rollback Levels

### Level 1: Application Configuration Rollback
**Scope:** Frontend/Backend application settings and environment variables
**Impact:** Low - affects application behavior but not infrastructure

**Rollback Process:**
1. **Identify the rollback point:**
   ```bash
   # List recent deployments
   kubectl get deployments -n dealcycle-crm --sort-by=.metadata.creationTimestamp
   
   # Check deployment history
   kubectl rollout history deployment/dealcycle-frontend -n dealcycle-crm
   kubectl rollout history deployment/dealcycle-backend -n dealcycle-crm
   ```

2. **Rollback to previous version:**
   ```bash
   # Rollback frontend
   kubectl rollout undo deployment/dealcycle-frontend -n dealcycle-crm
   
   # Rollback backend
   kubectl rollout undo deployment/dealcycle-backend -n dealcycle-crm
   ```

3. **Verify rollback success:**
   ```bash
   # Check rollout status
   kubectl rollout status deployment/dealcycle-frontend -n dealcycle-crm
   kubectl rollout status deployment/dealcycle-backend -n dealcycle-crm
   
   # Verify configuration
   kubectl get configmap app-config -n dealcycle-crm -o yaml
   kubectl get configmap settings-config -n dealcycle-crm -o yaml
   ```

### Level 2: Settings Configuration Rollback
**Scope:** User settings, feature flags, and system preferences
**Impact:** Medium - affects user experience and system behavior

**Rollback Process:**
1. **Restore previous settings configuration:**
   ```bash
   # Apply previous settings configmap
   kubectl apply -f rollback-snapshot-{DEPLOYMENT_ID}.yaml
   
   # Or manually restore specific settings
   kubectl patch configmap settings-config -n dealcycle-crm --patch-file=- <<EOF
   data:
     settings.json: |
       # Previous settings content here
   EOF
   ```

2. **Restart affected services:**
   ```bash
   # Restart services to pick up new configuration
   kubectl rollout restart deployment/dealcycle-frontend -n dealcycle-crm
   kubectl rollout restart deployment/dealcycle-backend -n dealcycle-crm
   ```

3. **Verify settings restoration:**
   ```bash
   # Check settings configuration
   kubectl get configmap settings-config -n dealcycle-crm -o yaml
   
   # Test critical functionality
   kubectl run test-pod --image=curlimages/curl --rm -it --restart=Never -- \
     curl -f http://dealcycle-frontend.dealcycle-crm.svc.cluster.local:3001/api/settings
   ```

### Level 3: Infrastructure Configuration Rollback
**Scope:** Terraform infrastructure, Kubernetes resources, and networking
**Impact:** High - affects system availability and performance

**Rollback Process:**
1. **Terraform rollback:**
   ```bash
   cd infrastructure/terraform
   
   # Check current state
   terraform show
   
   # List available states
   terraform state list
   
   # Rollback to previous state (if using remote state)
   terraform state pull > current.tfstate
   terraform state push previous.tfstate
   
   # Or apply previous configuration
   terraform apply -var-file="environments/{ENVIRONMENT}.tfvars" -backup=backup.tfstate
   ```

2. **Kubernetes resource rollback:**
   ```bash
   # Apply previous Kubernetes configuration
   kubectl apply -f rollback-snapshot-{DEPLOYMENT_ID}.yaml
   
   # Or restore specific resources
   kubectl apply -f infrastructure/kubernetes/namespaces/
   kubectl apply -f infrastructure/kubernetes/configmaps/
   kubectl apply -f infrastructure/kubernetes/secrets/
   kubectl apply -f infrastructure/kubernetes/deployments/
   kubectl apply -f infrastructure/kubernetes/services/
   kubectl apply -f infrastructure/kubernetes/ingress/
   ```

3. **Verify infrastructure restoration:**
   ```bash
   # Check cluster health
   kubectl get nodes
   kubectl get pods --all-namespaces
   
   # Verify services
   kubectl get services --all-namespaces
   kubectl get ingress --all-namespaces
   
   # Test connectivity
   kubectl run test-pod --image=curlimages/curl --rm -it --restart=Never -- \
     curl -f https://{INGRESS_HOST}/health
   ```

## Emergency Rollback Procedures

### Immediate Rollback (Critical Issues)
**Use when:** System is down, data corruption, security breach

1. **Stop all deployments:**
   ```bash
   # Pause all deployments
   kubectl patch deployment dealcycle-frontend -n dealcycle-crm -p '{"spec":{"paused":true}}'
   kubectl patch deployment dealcycle-backend -n dealcycle-crm -p '{"spec":{"paused":true}}'
   ```

2. **Restore last known good state:**
   ```bash
   # Apply emergency rollback snapshot
   kubectl apply -f emergency-rollback-snapshot.yaml
   
   # Force restart services
   kubectl delete pods -n dealcycle-crm -l app=dealcycle-frontend
   kubectl delete pods -n dealcycle-crm -l app=dealcycle-backend
   ```

3. **Verify system recovery:**
   ```bash
   # Check system health
   kubectl get pods -n dealcycle-crm
   kubectl logs -n dealcycle-crm deployment/dealcycle-frontend --tail=50
   kubectl logs -n dealcycle-crm deployment/dealcycle-backend --tail=50
   ```

### Partial Rollback (Feature Issues)
**Use when:** Specific features are broken, performance degradation

1. **Identify affected components:**
   ```bash
   # Check component health
   kubectl get pods -n dealcycle-crm -o wide
   kubectl top pods -n dealcycle-crm
   
   # Review recent logs
   kubectl logs -n dealcycle-crm deployment/dealcycle-frontend --since=1h
   ```

2. **Rollback specific components:**
   ```bash
   # Rollback specific deployment
   kubectl rollout undo deployment/dealcycle-frontend -n dealcycle-crm --to-revision={REVISION}
   
   # Or restore specific configuration
   kubectl patch configmap {CONFIG_NAME} -n dealcycle-crm --patch-file=- <<EOF
   data:
     # Previous configuration here
   EOF
   ```

3. **Monitor recovery:**
   ```bash
   # Watch recovery progress
   kubectl rollout status deployment/dealcycle-frontend -n dealcycle-crm
   
   # Check metrics
   kubectl top pods -n dealcycle-crm
   ```

## Rollback Validation

### Health Checks
After any rollback, perform these validation steps:

1. **System Health:**
   ```bash
   # Check all pods are running
   kubectl get pods -n dealcycle-crm
   
   # Verify services are accessible
   kubectl get endpoints -n dealcycle-crm
   
   # Check ingress configuration
   kubectl get ingress -n dealcycle-crm
   ```

2. **Application Health:**
   ```bash
   # Test health endpoints
   curl -f https://{INGRESS_HOST}/health
   curl -f https://{INGRESS_HOST}/api/health
   
   # Check application logs
   kubectl logs -n dealcycle-crm deployment/dealcycle-frontend --tail=100
   kubectl logs -n dealcycle-crm deployment/dealcycle-backend --tail=100
   ```

3. **Configuration Validation:**
   ```bash
   # Verify configuration files
   kubectl get configmap -n dealcycle-crm -o yaml
   
   # Check environment variables
   kubectl exec -n dealcycle-crm deployment/dealcycle-frontend -- env | grep -E "(NEXT_PUBLIC_|API_)"
   ```

### Performance Validation
1. **Response Times:**
   ```bash
   # Test response times
   time curl -s https://{INGRESS_HOST}/health
   time curl -s https://{INGRESS_HOST}/api/health
   ```

2. **Resource Usage:**
   ```bash
   # Monitor resource consumption
   kubectl top pods -n dealcycle-crm
   kubectl top nodes
   ```

3. **Error Rates:**
   ```bash
   # Check error logs
   kubectl logs -n dealcycle-crm deployment/dealcycle-frontend --since=5m | grep -i error
   kubectl logs -n dealcycle-crm deployment/dealcycle-backend --since=5m | grep -i error
   ```

## Rollback Communication

### Internal Communication
1. **Immediate Notification:**
   - Alert DevOps team via Slack/Teams
   - Update incident management system
   - Notify stakeholders of rollback

2. **Status Updates:**
   - Provide regular updates during rollback
   - Document rollback progress
   - Communicate expected recovery time

3. **Post-Rollback Review:**
   - Schedule post-mortem meeting
   - Document lessons learned
   - Update rollback procedures

### External Communication
1. **User Notification:**
   - Update status page
   - Send user communications if needed
   - Provide estimated resolution time

2. **Stakeholder Updates:**
   - Brief management on rollback status
   - Update project documentation
   - Communicate impact assessment

## Rollback Prevention

### Pre-Deployment Checks
1. **Configuration Validation:**
   - Validate all configuration files
   - Test configuration in staging environment
   - Verify configuration compatibility

2. **Rollback Testing:**
   - Test rollback procedures in staging
   - Verify rollback snapshots are valid
   - Practice emergency rollback procedures

3. **Deployment Planning:**
   - Schedule deployments during low-traffic periods
   - Prepare rollback team and resources
   - Have rollback procedures ready

### Monitoring and Alerting
1. **Health Monitoring:**
   - Monitor system health during deployment
   - Set up automated health checks
   - Configure alerting for critical issues

2. **Performance Monitoring:**
   - Track response times and error rates
   - Monitor resource usage
   - Set up performance alerts

3. **Rollback Triggers:**
   - Define automatic rollback conditions
   - Set up rollback alerts
   - Configure rollback timeouts

## Rollback Documentation

### Required Documentation
1. **Rollback Procedures:**
   - Step-by-step rollback instructions
   - Emergency rollback procedures
   - Partial rollback procedures

2. **Rollback History:**
   - Record all rollbacks performed
   - Document rollback reasons
   - Track rollback success/failure

3. **Lessons Learned:**
   - Document rollback challenges
   - Update procedures based on experience
   - Share knowledge across team

### Maintenance
1. **Regular Review:**
   - Review rollback procedures quarterly
   - Update procedures based on system changes
   - Validate rollback snapshots regularly

2. **Team Training:**
   - Train team on rollback procedures
   - Practice rollback scenarios
   - Update rollback documentation

## Support and Escalation

### Support Levels
1. **Level 1:** DevOps team (immediate response)
2. **Level 2:** Senior DevOps engineer (escalation)
3. **Level 3:** System architect (critical issues)

### Escalation Triggers
- Rollback takes longer than 30 minutes
- Multiple rollback attempts fail
- System remains unavailable after rollback
- Data integrity issues detected

### Emergency Contacts
- **DevOps Lead:** [Contact Information]
- **System Architect:** [Contact Information]
- **On-Call Engineer:** [Contact Information]

---

## Quick Reference

### Common Rollback Commands
```bash
# Rollback deployment
kubectl rollout undo deployment/{DEPLOYMENT_NAME} -n dealcycle-crm

# Check rollout status
kubectl rollout status deployment/{DEPLOYMENT_NAME} -n dealcycle-crm

# View rollout history
kubectl rollout history deployment/{DEPLOYMENT_NAME} -n dealcycle-crm

# Apply rollback snapshot
kubectl apply -f rollback-snapshot-{ID}.yaml

# Restart deployment
kubectl rollout restart deployment/{DEPLOYMENT_NAME} -n dealcycle-crm
```

### Emergency Rollback
```bash
# Pause deployments
kubectl patch deployment dealcycle-frontend -n dealcycle-crm -p '{"spec":{"paused":true}}'

# Apply emergency snapshot
kubectl apply -f emergency-rollback-snapshot.yaml

# Force restart
kubectl delete pods -n dealcycle-crm -l app=dealcycle-frontend
```

### Health Check Commands
```bash
# Check system health
kubectl get pods -n dealcycle-crm
kubectl get services -n dealcycle-crm
kubectl get ingress -n dealcycle-crm

# Test endpoints
curl -f https://{INGRESS_HOST}/health
curl -f https://{INGRESS_HOST}/api/health
```

---

**Last Updated:** 2024-12-19  
**Version:** 1.0.0  
**Maintainer:** DevOps Team
