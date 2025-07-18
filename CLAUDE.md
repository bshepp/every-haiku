# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Every Haiku is a Firebase-based single-page application for generating, saving, and sharing haikus. It features both AI-powered generation (using Claude API) and template-based generation following traditional 5-7-5 syllable patterns.

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
- **Cloud Functions**: Four main functions in `functions/index.js`:
  - `generateAIHaiku`: Calls Claude API for AI-powered haikus
  - `generateHashtags`: Creates relevant hashtags for haikus
  - `getUserStats`: Returns user statistics
  - `cleanupOldHaikus`: Scheduled function for auto-cleanup

### Data Architecture
- **Firestore Collections**:
  - `users`: User profiles with display names
  - `haikus`: All haikus with ownership and visibility flags
  - `userHaikus/{userId}/saved`: References to saved haikus per user
- **Security**: Comprehensive rules in `firestore.rules` ensuring users can only modify their own content

### Key Implementation Patterns
1. **Authentication flow**: Uses `onAuthStateChanged` listener for real-time auth state
2. **Error handling**: All async operations wrapped in try-catch with user-friendly messages
3. **Loading states**: Consistent loading indicators during async operations
4. **View management**: Simple `showView()` function for SPA navigation
5. **Batch operations**: Uses Firestore batches for bulk deletions in cleanup

## Important Notes

- **API Keys**: Claude API key must be set via Firebase config, never committed to code
- **Single HTML file**: All frontend changes must be made in `public/index.html` - do not create separate JS files
- **ESLint required**: Functions must pass linting before deployment (`npm run lint`)
- **Emulator ports**: Auth (9099), Functions (5001), Firestore (8080), Hosting (5000)
- **Node version**: Functions require Node.js 20 (specified in package.json)
- **No unit tests**: Project currently has no test suite - manual testing required