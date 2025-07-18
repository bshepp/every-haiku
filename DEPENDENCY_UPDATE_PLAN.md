# Dependency Update Plan - Every Haiku

## Current vs Target Versions

### Frontend (CDN Dependencies)
| Dependency | Current Version | Target Version | Breaking Changes |
|------------|----------------|----------------|------------------|
| Firebase JS SDK | 10.7.1 | 11.10.0 | Minor - compat mode still supported |
| TailwindCSS | 3.x (unversioned) | 3.x (keep as is) | None - already on LTS |

### Backend (Node.js Dependencies)
| Dependency | Current Version | Target Version | Breaking Changes |
|------------|----------------|----------------|------------------|
| Node.js Runtime | 18 | 20 LTS | None - fully compatible |
| firebase-admin | ^11.8.0 | ^13.4.0 | MAJOR - Modular API |
| firebase-functions | ^4.3.1 | ^6.4.0 | MAJOR - Config changes |
| node-fetch | ^2.6.7 | Keep v2 | v3 is ESM-only, incompatible |

### Security Vulnerabilities
- **Critical**: protobufjs vulnerability in firebase-admin 11.x
- **Fix**: Upgrade to firebase-admin 13.x resolves this

## Migration Strategy

### Phase 1: Backend Dependencies Update
1. Update Node.js runtime to 20
2. Update firebase-admin to 13.x (fixes security vulnerabilities)
3. Update firebase-functions to 6.x
4. Migrate from deprecated functions.config() to environment variables
5. Update code for modular API patterns

### Phase 2: Frontend Dependencies Update
1. Update Firebase JS SDK to 11.x
2. Keep TailwindCSS as-is (already optimal)
3. Test all functionality with new SDK

### Phase 3: Testing & Documentation
1. Test with Firebase emulators
2. Update documentation
3. Create migration guide

## Breaking Changes to Address

### 1. Firebase Admin SDK (11 → 13)
```javascript
// OLD (Namespace pattern)
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// NEW (Modular pattern)
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const app = initializeApp();
const db = getFirestore();
```

### 2. Firebase Functions (4 → 6)
```javascript
// OLD (functions.config())
const CLAUDE_API_KEY = functions.config().claude.api_key;

// NEW (process.env)
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
```

### 3. Firebase JS SDK (10 → 11)
- No breaking changes for compat mode
- Future consideration: migrate to modular API

## Implementation Order
1. Create backup of current code
2. Update package.json with new versions
3. Update Cloud Functions code for modular imports
4. Update environment variable handling
5. Update frontend Firebase SDK
6. Test all functionality
7. Update documentation

## Risk Mitigation
- Keep node-fetch at v2 (v3 is ESM-only, would require major refactoring)
- Use Firebase compat mode on frontend to minimize changes
- Test thoroughly with emulators before deployment
- Create rollback plan