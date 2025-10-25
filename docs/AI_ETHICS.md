# Ethics & AI Usage Reflection

This document summarizes how AI tools were used during the project, the risks considered, and the safeguards we applied. It also clarifies licensing and data/privacy practices. The intent is transparency and reproducibility.

## Where AI Was Used
- Requirement clarifications, small planning outlines, and checklists
- Drafting documentation boilerplate (README sections, setup steps, contribution notes)
- Generating small functions/boilerplate and refactor suggestions (curated by maintainers)
- Producing test scaffolding and coverage improvement ideas

## Human Review & Validation
- All AI‑generated suggestions were reviewed, edited, and validated by maintainers
- Tests (pytest with coverage gate) and manual verification back up changes
- Security‑sensitive components (auth, password hashing, sessions) were carefully audited

## Risks Considered
- Incorrect or hallucinated APIs, fragile code patterns
- Security oversights (auth bypasses, unsafe file handling, leaks)
- Licensing/IP contamination when integrating generated text/code
- Over‑reliance on AI vs. critical engineering judgment
- Potential bias or misleading examples in generated content

## Mitigations
- Cross‑check against official docs and the codebase before merging
- Enforce CI (lint + tests + coverage gate ≥ 60%)
- Prefer small PRs with focused scope and clear test additions
- Keep dependencies minimal and pinned; avoid copying proprietary content
- Use permissive repository license and attribute external sources when appropriate

## Data & Privacy Practices
- No production secrets or personal data were shared with AI tools
- Local environment variables and credentials are excluded from prompts and the repository
- Uploaded files (e.g., avatars) are for local dev only; sensitive data is not included

## Attribution & Licensing
- AI outputs are treated as drafts; final responsibility lies with maintainers
- Content is integrated under the repository’s license; contributors ensure license compatibility

## Reflection
- AI accelerated drafting and small refactors; human review was essential for correctness and security
- Best results came from clear prompts, small changes, and immediate tests/CI feedback

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
