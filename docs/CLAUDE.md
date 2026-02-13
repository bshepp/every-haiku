# CLAUDE.md

**Name:** Every Haiku Creator
**Role:** Firebase haiku generation and social platform specialist

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Every Haiku is a Firebase-based single-page application for generating, saving, and sharing haikus. It features both AI-powered generation (using Claude API) and template-based generation following traditional 5-7-5 syllable patterns.

**Current Version**: 2.1 (Beta) - Core features working, v2.0 social features partially done (backend mostly complete, UI incomplete), v2.1 critical bug fixes and security hardening

## Architecture Updates (v2.0)

### Dependency Updates
- Firebase JS SDK: 10.7.1 → 11.10.0
- Firebase Admin: 11.8.0 → 13.4.0 (modular API)
- Firebase Functions: 4.3.1 → 6.4.0 (v2 API)
- Node.js: 18 → 20 LTS
- All security vulnerabilities resolved

### Breaking Changes Addressed
- Migrated to modular Firebase Admin imports (including `FieldValue` from `firebase-admin/firestore`)
- Updated to v2 Cloud Functions API
- Switched from `functions.config()` to environment variables
- See `MIGRATION_GUIDE.md` for details

## Commands

### Development Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Install function dependencies
cd functions && npm install && cd ..
```

### Local Development
```bash
# Start Firebase emulators (includes hosting, functions, Firestore, and auth)
firebase emulators:start

# Or from functions directory for functions only
cd functions && npm run serve
```
Access the app at http://localhost:5000

### Deployment
```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### Cloud Functions Development
```bash
cd functions

# Run linting (required before deploy)
npm run lint

# View function logs
npm run logs

# Deploy functions only
npm run deploy
```

### Configuration
```bash
# Set Claude API key for AI haiku generation (v2 functions use secrets)
firebase functions:secrets:set CLAUDE_API_KEY

# View current secrets
firebase functions:secrets:access CLAUDE_API_KEY
```

## Architecture

### Frontend Architecture
- **Single-file SPA**: All frontend code is in `public/index.html`
- **No build process**: Uses vanilla JavaScript with ES6+ features
- **Firebase compat library**: Uses v10 compat mode for broader browser support
- **TailwindCSS via CDN**: No local CSS build required
- **State management**: Simple app state object tracking current user, haiku, and view

### Backend Architecture
- **Cloud Functions**: Enhanced functions in `functions/index.js`:
  - **Content Generation**:
    - `generateAIHaiku`: Calls Claude API with rate limiting
    - `generateHashtags`: Creates relevant hashtags (requires authentication)
  - **User Management**:
    - `updateProfile`: Handle profile updates with username uniqueness
    - `getUserStats`: Returns comprehensive statistics
  - **Social Features**:
    - `toggleLike`: Like/unlike haikus with stats tracking
    - `toggleFollow`: Follow/unfollow users
    - `createCollection`: Create haiku collections
    - `addToCollection`: Add haikus to collections
  - **Maintenance**:
    - `cleanupOldHaikus`: Scheduled cleanup function

### Data Architecture
- **Firestore Collections**:
  - `users`: Enhanced profiles with username, bio, social links, stats
  - `usernames`: Username uniqueness enforcement
  - `haikus`: All haikus with likes, ownership, and visibility
  - `userHaikus/{userId}/saved`: References to saved haikus
  - `userLikes/{userId}/likes`: User's liked haikus
  - `following/{userId}/users`: Users being followed
  - `followers/{userId}/users`: User's followers
  - `collections`: User-created collections
  - `collectionHaikus/{collectionId}/haikus`: Haikus in collections
- **Security**: Comprehensive rules with granular access control, rate limiting, input validation, and `likes`/`likedBy` protection from direct client writes

### Key Implementation Patterns
1. **Authentication flow**: Uses `onAuthStateChanged` listener for real-time auth state
2. **Error handling**: All async operations wrapped in try-catch with user-friendly messages
3. **Loading states**: Consistent loading indicators during async operations
4. **View management**: Simple `showView()` function for SPA navigation
5. **Batch operations**: Uses Firestore batches for bulk operations
6. **Transactions**: Atomic operations for likes, follows, and username claims
7. **Rate limiting**: Server-side rate limiting (10 req/min) on all functions
8. **Real-time updates**: Live like counts and user stats
9. **XSS protection**: `escapeHtml()` utility sanitizes all user-generated content before HTML injection
10. **Batch profile fetching**: Gallery uses `where('__name__', 'in', ...)` to batch-load author profiles

## Important Notes

- **API Keys**: Claude API key set via `firebase functions:secrets:set CLAUDE_API_KEY`, never committed
- **Single file frontend**: All code in `public/index.html` (~900 lines - consider refactoring)
- **Deployment**: `firebase deploy` (requires `.firebaserc` setup first)
- **Emulator ports**: Auth (9099), Functions (5001), Firestore (8080), Hosting (5000)
- **Node**: Functions require Node.js 20
- **Rate limiting**: 10 req/min per user (server-side, in-memory — does not persist across Cloud Functions instances)
- **Tests**: Jest + Cypress configured; Windows users should use `test-all.ps1`

## What's Actually Working

- AI haiku generation (Claude API)
- Template-based haiku generation (fallback)
- User authentication (email/password)
- Save/search haikus
- Public gallery with likes
- User profiles (basic - username, bio, links)
- Share on Twitter/X
- Auto-cleanup of old haikus

## What's Incomplete

- Collections UI (backend exists)
- Following/followers UI (backend exists)
- Activity feed (not started)
- Gallery pagination (loads up to 20, no "load more")
- Profile pictures (not implemented)
- Form validation (minimal UX feedback)
- Rate limiting is in-memory only (resets per Cloud Functions instance)