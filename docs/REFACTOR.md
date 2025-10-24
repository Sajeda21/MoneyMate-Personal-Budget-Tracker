# Refactor & Optimization Report

This document aggregates refactoring work, the rationale, and before/after metrics per PR.

## Baseline (before refactor PRs)
- Coverage: enforced ≥60% in CI (see Actions > metrics artifacts for coverage.xml)
- Cyclomatic complexity: see Actions artifact radon-cc.txt (grades by file/function)
- Lint issues: see `flake8 --count` in CI logs
- Performance: manual spot-check (local) — acceptable for dev; no regression targets yet

## PR Template (example)
- Title: refactor: extract expense breakdown rendering & helpers
- Summary: Split large functions into smaller helpers, reduce duplication, improve readability.
- Changes:
  - Extracted `updateBreakdownSummary`, `refreshCategorySummary`, `updateCategoryDetails`
  - Reduced branching and repeated DOM updates
- Metrics:
  - Complexity: radon cc from C to B for static/js/script.js breakdown section
  - Coverage: +5% (new tests for transactions summary and breakdown helpers)
  - Lint issues: -10
  - Performance: negligible impact
- Risks: minimal; UI behavior unchanged
- Review checklist: tests green, CI passing

## Completed Refactors
- (Add entries as PRs are merged)
