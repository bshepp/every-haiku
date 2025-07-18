# Every Haiku - Quick Reference Guide

## 🚀 Quick Commands

### Development
```bash
# Install dependencies
cd functions && npm install && cd ..
npm install

# Run locally with emulators
firebase emulators:start

# Run all tests
./test-all.sh

# Run specific tests
cd functions && npm test                    # Unit tests
npx cypress open                            # E2E tests interactive
npx cypress run                             # E2E tests headless
```

### Deployment
```bash
# Deploy everything
firebase deploy

# Deploy specific components
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## 📁 Key Files

### Configuration
- `firebase.json` - Firebase project configuration
- `firestore.rules` - Database security rules
- `firestore-indexes.json` - Database indexes
- `.env.example` - Environment variables template

### Source Code
- `public/index.html` - Main application (all frontend code)
- `functions/index.js` - All Cloud Functions

### Testing
- `functions/__tests__/` - Unit tests
- `cypress/e2e/` - End-to-end tests
- `test-all.sh` - Run all tests

### Documentation
- `README.md` - Project overview
- `TESTING.md` - Testing guide
- `PROJECT_REVIEW.md` - Comprehensive review
- `FUTURE_IMPROVEMENTS.md` - Roadmap

## 🔧 Environment Setup

### Required Secrets
```bash
# Set Claude API key
firebase functions:secrets:set CLAUDE_API_KEY

# For local development
echo "CLAUDE_API_KEY=your-key-here" > functions/.env
```

### Firebase Configuration
Update in `public/index.html`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

## 📊 Cloud Functions

| Function | Purpose | Rate Limit |
|----------|---------|------------|
| `generateAIHaiku` | Generate AI haiku with Claude | 10/min |
| `generateHashtags` | Generate relevant hashtags | 10/min |
| `cleanupOldHaikus` | Delete unsaved haikus >30 days | Scheduled |
| `updateProfile` | Update user profile | 10/min |
| `toggleLike` | Like/unlike haiku | 10/min |
| `toggleFollow` | Follow/unfollow user | 10/min |
| `createCollection` | Create haiku collection | 10/min |
| `addToCollection` | Add haiku to collection | 10/min |

## 🗄️ Database Structure

### Collections
- `users/{userId}` - User profiles
- `haikus/{haikuId}` - All haikus
- `usernames/{username}` - Username registry
- `likes/{userId}_{haikuId}` - Like relationships
- `follows/{followerId}_{followingId}` - Follow relationships
- `collections/{collectionId}` - User collections
- `collectionHaikus/{collectionId}/haikus/{haikuId}` - Collection contents

### Indexes
All required indexes are defined in `firestore-indexes.json`

## 🔒 Security Features

1. **Authentication Required**: For saving, liking, following
2. **Rate Limiting**: 10 requests/minute per user
3. **Input Validation**: All inputs sanitized
4. **XSS Protection**: Safe rendering
5. **Username Uniqueness**: Enforced globally

## 🐛 Troubleshooting

### Common Issues

**Firebase emulators not starting**
```bash
# Kill existing processes
lsof -ti:8080,9099,5001,5000 | xargs kill -9
# Restart
firebase emulators:start
```

**Tests failing**
```bash
# Clear test data
rm -rf .firebase
# Reinstall dependencies
rm -rf node_modules functions/node_modules
npm install && cd functions && npm install
```

**Deployment errors**
```bash
# Check Firebase login
firebase login
# Verify project
firebase use --add
# Check indexes
firebase deploy --only firestore:indexes
```

## 📈 Monitoring

### Firebase Console
- **Functions**: View logs, errors, performance
- **Firestore**: Monitor usage, queries
- **Authentication**: User stats, providers
- **Hosting**: Traffic, bandwidth

### Local Testing
- **Coverage**: `functions/coverage/lcov-report/index.html`
- **Cypress Dashboard**: Screenshots and videos in `cypress/`

## 🚢 Production Checklist

- [ ] Set `.firebaserc` with production project ID
- [ ] Configure Claude API key in secrets
- [ ] Update Firebase config in `index.html`
- [ ] Deploy Firestore indexes
- [ ] Run all tests
- [ ] Enable monitoring alerts
- [ ] Set up backups
- [ ] Configure custom domain (optional)

## 📞 Support

- **Documentation**: See full docs in project root
- **Issues**: https://github.com/bshepp/Haiku/issues
- **Updates**: Check `CHANGELOG.md` for version history