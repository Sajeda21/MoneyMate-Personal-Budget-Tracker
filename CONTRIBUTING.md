# Contributing Guide

## Code Style
- Python: Black (line-length 100) and Flake8. See pyproject.toml and .flake8.
- JavaScript: ESLint (eslint:recommended). See .eslintrc.json.

## Branch & PR Workflow
1. Create feature branch from main
2. Write tests (pytest) and keep coverage ≥ 60%
3. Run linters locally
   - `black . --check`
   - `flake8`
   - (Optional) `npx eslint static/js/script.js`
4. Open PR and ensure CI passes
5. For refactors, include metrics in PR description:
   - Cyclomatic complexity (before → after) if available
   - Coverage delta
   - Performance (response time/memory) if measured
   - Lint issues fixed

## Running Tests
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
pytest
```

## Running Locally
See docs/SETUP.md

## Commit Messages
Use conventional style where possible (feat, fix, docs, chore, refactor).
