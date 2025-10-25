# Ethics & AI Usage Reflection

This document explains where AI tools were used, risks considered, and how we mitigated them.

## Where AI Was Used
- Requirements grooming and feature planning
- Drafting documentation (README, SETUP, API, FEATURES)
- Code assistance for UI wiring and endpoints (small functions/boilerplate)
- Suggestions for refactoring and architecture notes

## Human Review & Validation
- All AI outputs were reviewed and edited by developers
- Tests (pytest) and manual verification were used to validate changes
- Security-sensitive code (auth, password handling, file uploads) reviewed carefully

## Risks Considered
- Hallucinated or incorrect APIs/code
- Security oversights (auth bypass, unsafe file handling)
- License/IP contamination from AI-generated content
- Over-reliance on AI without verification
- Bias or non-representative examples in generated content

## Mitigations
- Cross-check against codebase and official docs before merging
- Enforce CI: linting (Flake8/Black/ESLint) and tests with coverage gate (≥60%)
- Use permissive MIT license and avoid copying proprietary text/code
- Small, incremental PRs with review
- Keep dependencies minimal, pinned in requirements

## Data & Privacy
- No production secrets or personal data were shared with AI tools
- Local environment variables and credentials are excluded from prompts and repo
- Uploaded files (avatars) stored locally in dev; do not include sensitive data

## Attribution & Licensing
- AI-generated content is curated and integrated by maintainers
- The repository is licensed under MIT; contributors should ensure inputs are license-compatible

## Reflection
- AI sped up drafting and small coding tasks; human review was essential for correctness and security
- Best results came from clear prompts and small, verifiable changes
