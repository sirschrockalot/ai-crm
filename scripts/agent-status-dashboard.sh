#!/bin/bash

# Agent Status Dashboard
# This script provides a detailed status dashboard for all development agents

echo "📊 Agent Status Dashboard"
echo "========================"
echo ""

# Function to get agent status
get_agent_status() {
    local agent_id=$1
    local agent_name=$2
    local story_ids=$3
    local priority=$4
    
    echo "🏃 $agent_name"
    echo "   Agent ID: $agent_id"
    echo "   Priority: $priority"
    echo "   Stories: $story_ids"
    
    # Check recent activity
    recent_commits=$(git log --oneline --since="3 days ago" --grep="$agent_id" | wc -l)
    echo "   Recent Activity: $recent_commits commits in last 3 days"
    
    # Check story progress
    for story in $story_ids; do
        story_file="docs/stories/$story.md"
        if [ -f "$story_file" ]; then
            if grep -q "✅ COMPLETED" "$story_file"; then
                echo "   📋 Story $story: ✅ COMPLETED"
            elif grep -q "🔄 IN PROGRESS" "$story_file"; then
                echo "   📋 Story $story: 🔄 IN PROGRESS"
            else
                echo "   📋 Story $story: ⏳ NOT STARTED"
            fi
        else
            echo "   📋 Story $story: ❌ STORY FILE NOT FOUND"
        fi
    done
    
    echo ""
}

# Function to check file changes
check_file_changes() {
    local agent_id=$1
    local file_patterns=$2
    
    echo "📁 File Changes for $agent_id:"
    for pattern in $file_patterns; do
        if git ls-files | grep -q "$pattern"; then
            last_modified=$(git log --format="%ad" --date=short -1 -- "$pattern" 2>/dev/null)
            if [ -n "$last_modified" ]; then
                echo "   ✅ $pattern - Last modified: $last_modified"
            else
                echo "   ⏳ $pattern - Exists but not modified"
            fi
        else
            echo "   ❌ $pattern - Not found"
        fi
    done
    echo ""
}

# Function to check blockers
check_blockers() {
    local agent_id=$1
    
    echo "🚨 Blockers for $agent_id:"
    blockers=$(git log --oneline --since="7 days ago" --grep="$agent_id" --grep="BLOCKER\|ISSUE\|ERROR\|DEPENDENCY" | head -3)
    if [ -n "$blockers" ]; then
        echo "$blockers"
    else
        echo "   ✅ No blockers found"
    fi
    echo ""
}

# Display agent status
echo "📋 Agent Status Overview"
echo "========================"

get_agent_status "lead-management-dev" "Agent 1: Lead Management Specialist" "2.3" "HIGH"
get_agent_status "analytics-dev" "Agent 2: Analytics Specialist" "3.2 3.3" "MEDIUM"
get_agent_status "automation-dev" "Agent 3: Automation Specialist" "4.1 4.2 4.3" "MEDIUM"
get_agent_status "dashboard-dev" "Agent 4: Dashboard Specialist" "5.1" "MEDIUM"
get_agent_status "integration-testing-dev" "Agent 5: Integration & Testing Specialist" "6.1 6.3" "LOW"

# File changes summary
echo "📁 File Changes Summary"
echo "======================"

check_file_changes "lead-management-dev" "src/frontend/hooks/services/useLeads.ts src/frontend/pages/leads/ src/frontend/components/ui/ErrorBoundary.tsx"
check_file_changes "analytics-dev" "src/frontend/pages/analytics/ src/frontend/components/analytics/ src/frontend/hooks/useAnalytics.ts"
check_file_changes "automation-dev" "src/frontend/pages/automation/ src/frontend/components/automation/ src/frontend/hooks/useAutomation.ts"
check_file_changes "dashboard-dev" "src/frontend/pages/dashboard.tsx src/frontend/components/dashboard/ src/frontend/hooks/useDashboard.ts"
check_file_changes "integration-testing-dev" "src/frontend/__tests__/ src/frontend/.storybook/ src/frontend/components/ui/"

# Blockers summary
echo "🚨 Blockers Summary"
echo "=================="

check_blockers "lead-management-dev"
check_blockers "analytics-dev"
check_blockers "automation-dev"
check_blockers "dashboard-dev"
check_blockers "integration-testing-dev"

# Overall progress
echo "📊 Overall Progress"
echo "=================="

total_stories=9
completed_stories=$(find docs/stories/ -name "*.md" -exec grep -l "✅ COMPLETED" {} \; 2>/dev/null | wc -l)
in_progress_stories=$(find docs/stories/ -name "*.md" -exec grep -l "🔄 IN PROGRESS" {} \; 2>/dev/null | wc -l)
not_started_stories=$((total_stories - completed_stories - in_progress_stories))

echo "📋 Story Status:"
echo "   ✅ Completed: $completed_stories/$total_stories"
echo "   🔄 In Progress: $in_progress_stories/$total_stories"
echo "   ⏳ Not Started: $not_started_stories/$total_stories"
echo "   📈 Overall Progress: $((completed_stories * 100 / total_stories))%"

# Recent activity
echo ""
echo "🕒 Recent Activity (Last 7 days)"
echo "================================"
git log --oneline --since="7 days ago" --grep="Story" | head -10

# Next steps
echo ""
echo "🎯 Next Steps"
echo "============="
echo "1. Review agent status and progress above"
echo "2. Address any blockers or dependencies"
echo "3. Coordinate integration points between agents"
echo "4. Update story completion status as needed"
echo "5. Schedule weekly integration checkpoints"
echo ""

echo "📊 Status dashboard complete!" 