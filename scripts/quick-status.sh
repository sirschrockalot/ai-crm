#!/bin/bash

# Quick Status Check
# This script provides a quick overview of all agent progress

echo "🚀 Quick Status Check - Frontend Migration"
echo "=========================================="
echo ""

# Quick agent status
echo "📋 Agent Status:"
echo "🏃 Agent 1 (Lead Management): Story 2.3"
echo "📊 Agent 2 (Analytics): Stories 3.2, 3.3"
echo "⚙️ Agent 3 (Automation): Stories 4.1, 4.2, 4.3"
echo "📈 Agent 4 (Dashboard): Story 5.1"
echo "🔧 Agent 5 (Integration): Stories 6.1, 6.3"
echo ""

# Check recent commits
echo "🕒 Recent Activity (Last 3 days):"
recent_commits=$(git log --oneline --since="3 days ago" --grep="Story" | wc -l)
echo "   Total story-related commits: $recent_commits"
git log --oneline --since="3 days ago" --grep="Story" | head -5
echo ""

# Check story completion
echo "📊 Story Completion:"
total_stories=9
completed_stories=$(find docs/stories/ -name "*.md" -exec grep -l "✅ COMPLETED" {} \; 2>/dev/null | wc -l)
in_progress_stories=$(find docs/stories/ -name "*.md" -exec grep -l "🔄 IN PROGRESS" {} \; 2>/dev/null | wc -l)
echo "   ✅ Completed: $completed_stories/$total_stories"
echo "   🔄 In Progress: $in_progress_stories/$total_stories"
echo "   📈 Progress: $((completed_stories * 100 / total_stories))%"
echo ""

# Check for blockers
echo "🚨 Recent Blockers:"
blockers=$(git log --oneline --since="7 days ago" --grep="BLOCKER\|ISSUE\|ERROR" | head -3)
if [ -n "$blockers" ]; then
    echo "$blockers"
else
    echo "   ✅ No recent blockers found"
fi
echo ""

# Quick file check
echo "📁 Key File Status:"
key_files=(
    "src/frontend/hooks/services/useLeads.ts"
    "src/frontend/pages/analytics/"
    "src/frontend/pages/automation/"
    "src/frontend/pages/dashboard.tsx"
    "src/frontend/__tests__/"
)

for file in "${key_files[@]}"; do
    if git ls-files | grep -q "$file"; then
        echo "   ✅ $file - Exists"
    else
        echo "   ⏳ $file - Not yet created"
    fi
done
echo ""

echo "📊 Quick status check complete!"
echo "For detailed status, run: ./scripts/check-agent-progress.sh"
echo "For full dashboard, run: ./scripts/agent-status-dashboard.sh" 