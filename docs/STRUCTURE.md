# Documentation Structure

## Overview

All documentation has been organized into `docs/` folder for cleaner root directory.

```
every-haiku/
├── README.md                    ← Start here (project overview)
├── docs/
│   ├── README.md               ← Documentation index
│   ├── QUICK_REFERENCE.md      ← Commands & shortcuts
│   ├── CLAUDE.md               ← Developer notes & architecture  
│   ├── setup-instructions.md   ← Setup & deployment guide
│   ├── TESTING.md              ← Testing framework info
│   ├── AI_AGENT_GUIDELINES.md  ← Dev guidelines
│   └── archived/               ← Historical/reference docs
│       ├── PROJECT_STATUS.md
│       ├── PROJECT_REVIEW.md
│       ├── CHANGELOG.md
│       ├── IMPLEMENTATION_PLAN.md
│       ├── FUTURE_IMPROVEMENTS.md
│       ├── MIGRATION_GUIDE.md
│       ├── CI_CD_SETUP.md
│       ├── DEPENDENCY_UPDATE_PLAN.md
│       ├── DEPLOYMENT_HAIKU.md
│       └── DOCUMENTATION_INDEX.md
├── public/
├── functions/
├── cypress/
└── ...
```

## What Goes Where

### **Active Development Docs** (in `docs/`)
- **QUICK_REFERENCE.md** - Run this first when working on the project
- **CLAUDE.md** - Architecture and developer notes
- **setup-instructions.md** - How to set up locally and deploy
- **TESTING.md** - Test framework and commands
- **AI_AGENT_GUIDELINES.md** - Tips for developers

### **Archived/Reference** (in `docs/archived/`)
- Historical status reports
- Version history and changelogs
- Migration guides (changes already applied)
- Planning documents (outdated)
- Feature roadmaps (aspirational)

## Quick Navigation

- **Just getting started?** → [docs/README.md](README.md)
- **Need commands?** → [docs/QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- **Setting up locally?** → [docs/setup-instructions.md](setup-instructions.md)
- **Want to code?** → [docs/CLAUDE.md](CLAUDE.md)
- **Running tests?** → [docs/TESTING.md](TESTING.md)
- **Looking for old stuff?** → [docs/archived/](archived/README.md)
