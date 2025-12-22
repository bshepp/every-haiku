# Migration Guide (Completed)

All dependency updates from v1.0 to v2.0 have been completed and applied to the codebase.

## Changes Applied

### Frontend
- Firebase JS SDK: 10.7.1 → 11.10.0 (no breaking changes, compat mode works)

### Backend
- Node.js: 18 → 20 LTS (fully compatible)
- firebase-admin: 11.8.0 → 13.4.0 (modular API now used)
- firebase-functions: 4.3.1 → 6.4.0 (v2 API now used)

### Code Updates Made
- Modular Firebase Admin imports (initializeApp, getFirestore, etc.)
- v2 Cloud Functions API (onCall, onSchedule)
- Environment variables instead of functions.config()

### Security
- Fixed critical protobufjs vulnerability
- Zero security vulnerabilities now

No further migration needed. The codebase is on current stable versions.

#### V2 Functions API
```javascript
// OLD (v1 functions)
const functions = require('firebase-functions');
exports.myFunction = functions.https.onCall((data, context) => {});

// NEW (v2 functions)
const { onCall } = require('firebase-functions/v2/https');
exports.myFunction = onCall((request) => {
  // data is now request.data
  // context is now request.auth, request.app, etc.
});
```

#### Environment Variables
```javascript
// OLD (deprecated functions.config())
const CLAUDE_API_KEY = functions.config().claude.api_key;

// NEW (process.env)
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
```

### 3. Configuration Changes

#### Setting Secrets
```bash
# OLD
firebase functions:config:set claude.api_key="YOUR_KEY"

# NEW (using Firebase secrets)
firebase functions:secrets:set CLAUDE_API_KEY
```

## Code Changes Made

### 1. Updated imports to modular pattern
- Migrated all firebase-admin imports
- Updated to v2 functions API

### 2. Added security features
- Input validation and sanitization
- Rate limiting implementation
- XSS protection

### 3. Fixed data model issues
- Eliminated duplicate haiku creation
- Proper update operations instead of creating new documents

### 4. Connected unused features
- AI haiku generation now calls actual Cloud Function
- Hashtag generation integrated
- User statistics dashboard implemented

## Testing Steps

1. **Install dependencies**:
   ```bash
   cd functions
   npm install
   ```

2. **Run linting**:
   ```bash
   npm run lint
   ```

3. **Start emulators**:
   ```bash
   firebase emulators:start
   ```

4. **Test functionality**:
   - Generate AI haiku
   - Save haiku
   - Make haiku public
   - View statistics
   - Check rate limiting

## Deployment Steps

1. **Update Node.js runtime** (if using Cloud Functions):
   - Ensure your deployment environment uses Node.js 20

2. **Set environment variables**:
   ```bash
   firebase functions:secrets:set CLAUDE_API_KEY
   ```

3. **Deploy functions**:
   ```bash
   firebase deploy --only functions
   ```

4. **Deploy hosting**:
   ```bash
   firebase deploy --only hosting
   ```

## Rollback Plan

If issues occur after deployment:

1. **Functions rollback**:
   ```bash
   firebase functions:delete <function-name>
   # Then redeploy old version
   ```

2. **Hosting rollback**:
   ```bash
   firebase hosting:rollback
   ```

## Notes

- The Firebase JS SDK compat mode is still supported in v11, but consider migrating to modular API in the future
- Node.js 18 is still supported but will reach end-of-life in April 2025
- All security vulnerabilities have been resolved with these updates
- Rate limiting has been added to prevent API abuse
- The application now properly tracks haiku lifecycle without creating duplicates