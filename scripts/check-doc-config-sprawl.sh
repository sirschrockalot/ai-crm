#!/bin/bash
# Guardrail script: Prevents config and documentation sprawl
# Fails if:
# - Any .env files are tracked (except .env.example)
# - Any markdown files exist outside /docs/ (except README.md, CONTRIBUTING.md, CHANGELOG.md)

set -e

ERRORS=0

echo "Checking for config and documentation sprawl..."

# Check for tracked .env files (except .env.example)
echo "Checking for tracked .env files..."
ENV_FILES=$(git ls-files | grep -E '^\.env($|\.)' | grep -v '^\.env\.example$' || true)

if [ -n "$ENV_FILES" ]; then
  echo "❌ ERROR: Found tracked .env files (except .env.example):"
  echo "$ENV_FILES"
  echo ""
  echo "Please remove these files from git tracking:"
  echo "  git rm --cached <file>"
  echo ""
  echo "Only .env.example should be tracked. Use Doppler for secrets management."
  ERRORS=$((ERRORS + 1))
fi

# Check for markdown files outside /docs/ (except README.md, CONTRIBUTING.md, CHANGELOG.md, .github templates, and component READMEs)
echo "Checking for markdown files outside /docs/..."
# Collect files that violate the rule, handling special characters properly
MD_FILES=""
while IFS= read -r file || [ -n "$file" ]; do
  # Skip files in docs/ (handle special characters in filenames)
  case "$file" in
    docs/*) continue ;;
    README.md) continue ;;
    CONTRIBUTING.md) continue ;;
    CHANGELOG.md) continue ;;
    .github/*) continue ;;
    */README.md) continue ;;
    *)
      if [ -z "$MD_FILES" ]; then
        MD_FILES="$file"
      else
        MD_FILES="$MD_FILES"$'\n'"$file"
      fi
      ;;
  esac
done < <(git ls-files -z '*.md' 2>/dev/null | tr '\0' '\n' || git ls-files '*.md' || true)

if [ -n "$MD_FILES" ]; then
  echo "❌ ERROR: Found markdown files outside /docs/ (except README.md, CONTRIBUTING.md, CHANGELOG.md, .github/ templates, and component README.md files):"
  echo "$MD_FILES"
  echo ""
  echo "Please move these files to /docs/ and update /docs/README.md:"
  echo "  git mv <file> docs/"
  echo "  # Then update docs/README.md to link to the new location"
  echo ""
  echo "All documentation must be in /docs/ and linked in /docs/README.md"
  ERRORS=$((ERRORS + 1))
fi

# Summary
if [ $ERRORS -eq 0 ]; then
  echo "✅ No config or documentation sprawl detected"
  exit 0
else
  echo ""
  echo "❌ Found $ERRORS issue(s). Please fix before committing."
  exit 1
fi
