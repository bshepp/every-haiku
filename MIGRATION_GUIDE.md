# Migration Guide - Every Haiku Dependency Updates

This guide documents the dependency updates performed and the breaking changes addressed.

## Summary of Updates

### Frontend Dependencies
- **Firebase JS SDK**: 10.7.1 → 11.10.0
- **TailwindCSS**: No change (using CDN v3.x LTS)

### Backend Dependencies  
- **Node.js Runtime**: 18 → 20 LTS
- **firebase-admin**: 11.8.0 → 13.4.0 (2 major versions)
- **firebase-functions**: 4.3.1 → 6.4.0 (2 major versions)
- **node-fetch**: 2.6.7 → 2.7.0 (security update)

### Security Fixes
- Fixed critical protobufjs vulnerability in firebase-admin
- All dependencies now pass security audit with 0 vulnerabilities

## Breaking Changes Addressed

### 1. Firebase Admin SDK (11 → 13)

#### Modular Import Pattern
```javascript
// OLD (Namespace pattern)
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// NEW (Modular pattern)
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp();
const db = getFirestore();
```

### 2. Firebase Functions (4 → 6)

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