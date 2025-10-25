#!/usr/bin/env bash
set -euo pipefail
# Requires: mermaid-cli (mmdc)
# Usage: ./scripts/render_diagrams.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIAG_DIR="$ROOT_DIR/docs/diagrams"
TMP_DIR="$DIAG_DIR/.tmp"
mkdir -p "$TMP_DIR"

render() {
  local mdfile="$1";
  local pngfile="$2";
  local tmpmmd="$TMP_DIR/$(basename "$mdfile" .md).mmd";
  # Extract first mermaid code block
  awk '/```mermaid/{flag=1; next} /```/{if(flag){flag=0; exit}} flag {print}' "$mdfile" > "$tmpmmd"
  if [ ! -s "$tmpmmd" ]; then
    echo "No mermaid content found in $mdfile" >&2
    return 1
  fi
  mmdc -i "$tmpmmd" -o "$pngfile" -b transparent -w 1200 || return 1
  echo "Rendered $pngfile"
}

render "$DIAG_DIR/usecase_diagram.md" "$DIAG_DIR/usecase_diagram.png"
render "$DIAG_DIR/class_diagram.md" "$DIAG_DIR/class_diagram.png"
render "$DIAG_DIR/sequence_add_expense.md" "$DIAG_DIR/sequence_add_expense.png"
render "$DIAG_DIR/sequence_view_breakdown.md" "$DIAG_DIR/sequence_view_breakdown.png"
render "$DIAG_DIR/component_architecture.md" "$DIAG_DIR/component_architecture.png"

rm -rf "$TMP_DIR"
