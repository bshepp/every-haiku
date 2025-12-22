# Every Haiku - Project Status

## What's Done

**Core v1.0 Features** - Fully working
- AI haiku generation (Claude API)
- Template-based generation fallback
- User authentication
- Save/search haikus
- Public gallery
- Like haikus
- Share on Twitter/X
- Auto-cleanup of old unsaved haikus

**Dependencies** - Updated
- Firebase JS SDK 11.10.0
- Firebase Admin 13.4.0 (modular)
- Firebase Functions v2 API (v6.4.0)
- Node.js 20 LTS
- No security vulnerabilities

**Infrastructure**
- Rate limiting (10 req/min)
- Input validation
- Firestore security rules
- ESLint configured

## What's Partial (v2.0)

**User Profiles** - Backend done, basic UI works
**Like System** - Functional, integrated
**User Stats** - Backend tracks, minimal UI

## What's Not Done (v2.0)

- Collections UI (backend exists)
- Following/followers UI (backend exists) 
- Activity feed
- Gallery pagination
- Profile pictures

## Known Issues

- Frontend is 885 lines in one HTML file (hard to maintain)
- Rate limiting is in-memory (resets on function restart)
- Tests configured but not verified as passing
- No pagination on gallery
- Minimal error messages to users

## To Deploy

1. Create `.firebaserc` with your Firebase project ID
2. Update Firebase config in `public/index.html`
3. Set Claude API key: `firebase functions:secrets:set CLAUDE_API_KEY`
4. Deploy indexes: `firebase deploy --only firestore:indexes`
5. Test locally with emulator first: `firebase emulators:start`
6. Deploy: `firebase deploy`

## Suggested Next Steps

If continuing development:
1. Refactor frontend (split into separate JS files)
2. Fix rate limiting to persist across restarts
3. Add gallery pagination
4. Hide unimplemented features
5. Complete collections UI (if wanted)

**Rough time to deploy v1.0**: 4 hours
**Time to complete v2.0**: 20+ more hours

## Docs

- **README.md** - Overview
- **setup-instructions.md** - Setup details
- **TESTING.md** - Test info
- **CHANGELOG.md** - History
- **CLAUDE.md** - Dev notes

**Version**: 2.0.0 Beta | **Status**: Partial