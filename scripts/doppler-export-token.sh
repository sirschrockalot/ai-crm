#!/usr/bin/env bash
# Print the export line so you can run Doppler from any directory.
# Run from ai-crm (where Doppler is set up), then add the output to ~/.zshrc and run: source ~/.zshrc
#
# Option: create a service token (works from any directory; recommended):
#   doppler configs tokens create dev-local --project ai-crm --config dev --plain
# Then add: export DOPPLER_TOKEN="dp.st.dev.xxx"
set -e
USE_SERVICE_TOKEN="${1:-}"
if [ "$USE_SERVICE_TOKEN" = "--create" ]; then
  echo "# Creating a new service token (works from any directory)..."
  TOKEN=$(doppler configs tokens create dev-local --project ai-crm --config dev --plain 2>/dev/null || true)
else
  TOKEN=$(doppler configure debug 2>/dev/null | awk -F'│' '/^│ token / { gsub(/^[[:space:]]+|[[:space:]]+$/,"",$3); print $3; exit }')
fi
if [ -n "$TOKEN" ]; then
  echo "# Add to ~/.zshrc (or ~/.bashrc) so 'doppler run' works from any directory:"
  echo "export DOPPLER_TOKEN=\"$TOKEN\""
else
  echo "Run from ai-crm after 'doppler setup'. To create a token that works from any directory, run:"
  echo "  ./scripts/doppler-export-token.sh --create"
  echo "Or: doppler configs tokens create dev-local --project ai-crm --config dev --plain"
  exit 1
fi
