#!/bin/bash

# Agent Progress Monitoring Script
# This script checks the progress of each development agent

echo "📊 Agent Progress Monitoring Dashboard"
echo "====================================="
echo ""

# Function to check git commits by agent
check_agent_commits() {
    local agent_id=$1
    local agent_name=$2
    local story_ids=$3
    
    echo "🏃 $agent_name ($agent_id)"
    echo "--------------------------------"
    
    # Check recent commits for this agent
    echo "📝 Recent Commits:"
    git log --oneline --grep="$agent_id" --grep="Story" -10 | head -5
    
    # Check for story-specific commits
    for story in $story_ids; do
        echo "📋 Story $story commits:"
        git log --oneline --grep="Story $story" -5
    done
    
    echo ""
}

# Function to check file modifications
check_file_modifications() {
    local agent_id=$1
    local agent_name=$2
    local file_patterns=$3
    
    echo "📁 File Modifications:"
    for pattern in $file_patterns; do
        if git ls-files | grep -q "$pattern"; then
            echo "✅ $pattern - Modified"
        else
            echo "⏳ $pattern - Not yet modified"
        fi
    done
    echo ""
}

# Function to check story completion status
check_story_status() {
    local story_id=$1
    local story_file="docs/stories/$story_id.md"
    
    if [ -f "$story_file" ]; then
        echo "📖 Story $story_id: $story_file exists"
        # Check if story has completion markers
        if grep -q "✅ COMPLETED" "$story_file"; then
            echo "🎉 Story $story_id: COMPLETED"
        elif grep -q "🔄 IN PROGRESS" "$story_file"; then
            echo "🔄 Story $story_id: IN PROGRESS"
        else
            echo "⏳ Story $story_id: NOT STARTED"
        fi
    else
        echo "❌ Story $story_id: Story file not found"
    fi
}

# Check Agent 1: Lead Management Specialist
echo "🏃 Agent 1: Lead Management Specialist"
echo "====================================="
check_agent_commits "lead-management-dev" "Lead Management Specialist" "2.3"
check_file_modifications "lead-management-dev" "Lead Management Specialist" "src/frontend/hooks/services/useLeads.ts src/frontend/pages/leads/ src/frontend/components/ui/ErrorBoundary.tsx"
check_story_status "2.3.integrate-lead-management-shared-services"
echo ""

# Check Agent 2: Analytics Specialist
echo "📊 Agent 2: Analytics Specialist"
echo "================================"
check_agent_commits "analytics-dev" "Analytics Specialist" "3.2 3.3"
check_file_modifications "analytics-dev" "Analytics Specialist" "src/frontend/pages/analytics/ src/frontend/components/analytics/ src/frontend/hooks/useAnalytics.ts"
check_story_status "3.2.migrate-analytics-pages-dashboards"
check_story_status "3.3.integrate-analytics-shared-services"
echo ""

# Check Agent 3: Automation Specialist
echo "⚙️ Agent 3: Automation Specialist"
echo "================================"
check_agent_commits "automation-dev" "Automation Specialist" "4.1 4.2 4.3"
check_file_modifications "automation-dev" "Automation Specialist" "src/frontend/pages/automation/ src/frontend/components/automation/ src/frontend/hooks/useAutomation.ts"
check_story_status "4.1.migrate-automation-components"
check_story_status "4.2.migrate-automation-pages-workflows"
check_story_status "4.3.integrate-automation-shared-services"
echo ""

# Check Agent 4: Dashboard Specialist
echo "📈 Agent 4: Dashboard Specialist"
echo "================================"
check_agent_commits "dashboard-dev" "Dashboard Specialist" "5.1"
check_file_modifications "dashboard-dev" "Dashboard Specialist" "src/frontend/pages/dashboard.tsx src/frontend/components/dashboard/ src/frontend/hooks/useDashboard.ts"
check_story_status "5.1.migrate-dashboard-components-widgets"
echo ""

# Check Agent 5: Integration & Testing Specialist
echo "🔧 Agent 5: Integration & Testing Specialist"
echo "============================================"
check_agent_commits "integration-testing-dev" "Integration & Testing Specialist" "6.1 6.3"
check_file_modifications "integration-testing-dev" "Integration & Testing Specialist" "src/frontend/__tests__/ src/frontend/.storybook/ src/frontend/components/ui/"
check_story_status "6.1.consolidate-shared-components-utilities"
check_story_status "6.3.comprehensive-testing-validation"
echo ""

# Overall Progress Summary
echo "📊 Overall Progress Summary"
echo "=========================="
echo ""

# Count completed stories
completed_stories=$(find docs/stories/ -name "*.md" -exec grep -l "✅ COMPLETED" {} \; | wc -l)
total_stories=9

echo "📋 Story Completion: $completed_stories/$total_stories stories completed"
echo "📈 Progress: $((completed_stories * 100 / total_stories))% complete"
echo ""

# Check for recent activity
echo "🕒 Recent Activity (Last 7 days):"
git log --oneline --since="7 days ago" --grep="Story" | head -10
echo ""

# Check for blockers or issues
echo "🚨 Potential Blockers:"
git log --oneline --grep="BLOCKER\|ISSUE\|ERROR" --since="7 days ago" | head -5
echo ""

echo "📚 Documentation Status:"
echo "- Agent Assignments: $(ls docs/agent-assignments/ | wc -l) files"
echo "- Story Documentation: $(ls docs/stories/ | wc -l) files"
echo "- Architecture Documentation: $(ls docs/architecture/ | wc -l) files"
echo ""

echo "🎯 Next Steps:"
echo "1. Review individual agent progress above"
echo "2. Check for any blockers or issues"
echo "3. Coordinate integration points between agents"
echo "4. Update story completion status as needed"
echo ""

echo "📊 Progress monitoring complete!" 