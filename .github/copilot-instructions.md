# Project Guidelines

## Overview

Every Haiku — Firebase SPA for generating, saving, and sharing haikus (AI-powered via Claude API + template fallback). v2.1 Beta. Single-page app with no build process.

## Architecture

- **Frontend**: Single-file vanilla JS SPA at `public/index.html` (~900 lines, no framework, no build step)
- **Backend**: Firebase Cloud Functions (v2 API) in `functions/index.js`
- **Database**: Cloud Firestore with security rules in `firestore.rules`
- **Auth**: Firebase Auth (email/password)
- **Styling**: TailwindCSS via CDN
- **AI**: Claude API called from Cloud Functions (secret: `CLAUDE_API_KEY`)

All frontend code lives in one file. State is a simple JS object. Views switch via `showView()`. No modules, no bundler.

## Build and Test

```bash
# Install
cd functions && npm install && cd ..
npm install

# Local dev (emulators: Auth 9099, Functions 5001, Firestore 8080, Hosting 5000)
firebase emulators:start

# Run all tests
.\test-all.ps1             # Windows
./test-all.sh              # Linux/macOS

# Unit tests only
cd functions && npm test

# E2E tests (requires emulators running)
npx cypress run            # headless
npx cypress open           # interactive

# Lint (required before deploy)
cd functions && npm run lint

# Deploy
firebase deploy
```

## Conventions

- **Node.js 20** required for functions
- **Modular Firebase Admin imports** — use `firebase-admin/firestore` for `FieldValue`, not the legacy namespace
- **v2 Cloud Functions API** — use `firebase-functions/v2`, not `functions.https`
- **Environment variables** for config, not `functions.config()`
- **XSS protection**: Always use `escapeHtml()` when inserting user content into HTML
- **Rate limiting**: All Cloud Functions enforce 10 req/min per user (in-memory)
- **Transactions**: Use Firestore transactions for likes, follows, and username claims
- **Error handling**: Wrap all async operations in try-catch with user-friendly messages
- **Security rules**: `likes`/`likedBy` fields are protected from direct client writes — mutations go through Cloud Functions

## Key Patterns

- Frontend calls backend via `firebase.functions().httpsCallable('functionName')`
- Gallery batch-loads author profiles with `where('__name__', 'in', ...)`
- Username uniqueness enforced via separate `usernames` collection + transaction

## What's Incomplete

Collections UI, following/followers UI, activity feed, gallery pagination, profile pictures, form validation UX. Backend for collections and follows exists but has no frontend.

## Documentation

Detailed docs live in `docs/` — see [docs/STRUCTURE.md](docs/STRUCTURE.md) for the index.

- [docs/CLAUDE.md](docs/CLAUDE.md) — Full architecture, data model, and implementation details
- [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) — Commands and Cloud Functions reference
- [docs/TESTING.md](docs/TESTING.md) — Test framework, structure, and procedures
- [docs/AI_AGENT_GUIDELINES.md](docs/AI_AGENT_GUIDELINES.md) — Developer tips and data models
- [docs/setup-instructions.md](docs/setup-instructions.md) — Setup and deployment guide
