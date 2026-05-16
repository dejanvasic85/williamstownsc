#!/usr/bin/env bash
# Vercel ignored build step.
# Exit 0 -> skip build. Exit 1 -> proceed with build.
#
# Always build production deploys on main. For other refs, skip the build
# when the only diff vs the previous commit is in paths that don't affect
# the rendered site (e.g. the automated data/** sync PRs).

set -euo pipefail

if [[ "${VERCEL_GIT_COMMIT_REF:-}" == "main" ]]; then
  exit 1
fi

CHANGED=$(git diff --name-only HEAD^ HEAD 2>/dev/null || echo "")

if [[ -z "$CHANGED" ]]; then
  exit 1
fi

while IFS= read -r file; do
  case "$file" in
    data/*) ;;
    *) exit 1 ;;
  esac
done <<< "$CHANGED"

exit 0
