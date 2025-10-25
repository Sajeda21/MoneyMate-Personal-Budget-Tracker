#!/usr/bin/env bash
set -euo pipefail
# Render Mermaid blocks in docs/diagrams/*.md to PNG via Kroki
# Requires: curl, awk

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIAG_DIR="$ROOT_DIR/docs/diagrams"
TMP_DIR="$DIAG_DIR/.tmp"
mkdir -p "$TMP_DIR"

render_md() {
  local mdfile="$1";
  local pngfile="$2";
  local tmpmmd="$TMP_DIR/$(basename "$mdfile" .md).mmd";
  awk '/```mermaid/{flag=1; next} /```/{if(flag){flag=0; exit}} flag {print}' "$mdfile" > "$tmpmmd"
  if [ ! -s "$tmpmmd" ]; then
    echo "No mermaid content found in $mdfile" >&2
    return 1
  fi
  curl -sSf -X POST -H "Content-Type: text/plain" --data-binary @"$tmpmmd" \
    https://kroki.io/mermaid/png \
    -o "$pngfile"
  echo "Rendered $pngfile"
}

render_md "$DIAG_DIR/usecase_diagram.md" "$DIAG_DIR/usecase_diagram.png"
render_md "$DIAG_DIR/class_diagram.md" "$DIAG_DIR/class_diagram.png"
render_md "$DIAG_DIR/sequence_add_expense.md" "$DIAG_DIR/sequence_add_expense.png"
render_md "$DIAG_DIR/sequence_view_breakdown.md" "$DIAG_DIR/sequence_view_breakdown.png"
render_md "$DIAG_DIR/component_architecture.md" "$DIAG_DIR/component_architecture.png"

rm -rf "$TMP_DIR"
