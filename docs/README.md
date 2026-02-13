# Every Haiku - Documentation

## Active Development Docs

Read these if you're working on the project:

- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Commands, shortcuts, common tasks
- **[CLAUDE.md](CLAUDE.md)** - Development notes and architecture
- **[setup-instructions.md](setup-instructions.md)** - How to set up locally and deploy
- **[TESTING.md](TESTING.md)** - Testing framework and how to run tests
- **[AI_AGENT_GUIDELINES.md](AI_AGENT_GUIDELINES.md)** - Notes for developers

## Archived / Historical Docs

Reference only:

- **[archived/PROJECT_STATUS.md](archived/PROJECT_STATUS.md)** - Last status report
- **[archived/PROJECT_REVIEW.md](archived/PROJECT_REVIEW.md)** - Technical review
- **[archived/CHANGELOG.md](archived/CHANGELOG.md)** - Version history
- **[archived/DOCUMENTATION_INDEX.md](archived/DOCUMENTATION_INDEX.md)** - Old doc index
- **[archived/IMPLEMENTATION_PLAN.md](archived/IMPLEMENTATION_PLAN.md)** - What needs work
- **[archived/FUTURE_IMPROVEMENTS.md](archived/FUTURE_IMPROVEMENTS.md)** - Feature ideas
- **[archived/MIGRATION_GUIDE.md](archived/MIGRATION_GUIDE.md)** - v1 to v2 migration
- **[archived/CI_CD_SETUP.md](archived/CI_CD_SETUP.md)** - CI/CD info
- **[archived/DEPENDENCY_UPDATE_PLAN.md](archived/DEPENDENCY_UPDATE_PLAN.md)** - Update history
- **[archived/DEPLOYMENT_HAIKU.md](archived/DEPLOYMENT_HAIKU.md)** - Commemorative haiku

## Quick Start

```bash
# Install
cd functions && npm install && cd ..
npm install

# Run locally
firebase emulators:start

# Test
./test-all.sh              # Linux/macOS
.\test-all.ps1             # Windows (PowerShell)

# Deploy
firebase deploy
```

See [setup-instructions.md](setup-instructions.md) for detailed steps.
