# Notes for Developers

## Stack

- Frontend: ~900 lines of vanilla JS in `public/index.html`
- Backend: Firebase Cloud Functions in `functions/index.js`
- Database: Cloud Firestore
- Auth: Firebase Auth (email/password)
- AI: Claude API via Cloud Functions

## Quick Start

```bash
# Install deps
cd functions && npm install && cd ..

# Run locally
firebase emulators:start

# Deploy
firebase deploy
```

## Key Files

- `public/index.html` - Everything frontend (views, events, haiku generation)
- `functions/index.js` - All Cloud Functions (haiku generation, profiles, likes)
- `firestore.rules` - Database security
- `firestore-indexes.json` - Database indexes

## What Works

- Generate haikus (AI or template)
- Auth and profiles
- Save/search haikus
- Gallery with likes
- Share on Twitter/X

## What Doesn't

- Collections UI
- Following/followers UI
- Gallery pagination
- Profile pictures
- Form validation feedback

## To Add Features

Start by understanding:
1. Frontend state management (simple object in index.html)
2. How Cloud Functions are called (firebase.functions().httpsCallable)
3. Firestore data model (look at firestore.rules)
4. Security rules (in firestore.rules)

## Common Tasks

**Add a UI feature**: Edit index.html HTML + add event listener
**Add backend logic**: Edit functions/index.js
**Change database**: Update firestore.rules + firestore-indexes.json
**Deploy**: `firebase deploy`

3. **Haiku Management**
   - Save haikus to personal collection
   - Make haikus public for gallery
   - Search functionality
   - Auto-cleanup of unsaved haikus after 30 days

4. **Social Features**
   - Public gallery
   - Copy to clipboard
   - Share to Twitter/X
   - Automatic hashtag generation

## Data Models

### Firestore Collections

#### `users`
```javascript
{
  displayName: string,
  username: string,          // Unique, set once
  bio: string,              // Max 200 chars
  avatarUrl: string,
  website: string,
  socialLinks: {
    twitter: string,
    instagram: string
  },
  stats: {
    totalHaikus: number,
    totalLikes: number,
    totalFollowers: number,
    totalFollowing: number
  },
  preferences: {
    defaultPublic: boolean,
    emailNotifications: boolean
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `usernames`
```javascript
{
  userId: string,           // Reference to user
  createdAt: timestamp
}
```

#### `haikus`
```javascript
{
  content: string,           // The haiku text
  theme: string,            // User-provided theme
  isAI: boolean,            // AI-generated flag
  hashtags: string[],       // Generated hashtags
  userId: string,           // Owner's UID
  isPublic: boolean,        // Gallery visibility
  isSaved: boolean,         // Saved to collection
  likes: number,            // Like count
  likedBy: string[],        // Array of user IDs who liked
  createdAt: timestamp
}
```

#### `userHaikus/{userId}/saved`
```javascript
{
  savedAt: timestamp
}
```

#### `userLikes/{userId}/likes`
```javascript
{
  likedAt: timestamp
}
```

#### `following/{userId}/users`
```javascript
{
  followedAt: timestamp
}
```

#### `followers/{userId}/users`
```javascript
{
  followedAt: timestamp
}
```

#### `collections`
```javascript
{
  name: string,
  description: string,
  userId: string,
  isPublic: boolean,
  haikuCount: number,
  followerCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `collectionHaikus/{collectionId}/haikus`
```javascript
{
  addedAt: timestamp,
  order: number
}
```

## Code Conventions

### JavaScript Style
- ES6+ syntax (arrow functions, async/await, destructuring)
- Functional programming patterns where appropriate
- Clear variable naming (camelCase)
- Comprehensive error handling with try-catch blocks

### Frontend Patterns
1. **Single Page Application**: All views managed via DOM manipulation
2. **State Management**: Simple app state object for current user/haiku/view
3. **Event Delegation**: Direct event listeners on specific elements
4. **Async Operations**: Proper loading states and error messages

### Firebase Integration
1. **Compat Library**: Uses Firebase v11 compat for broader compatibility
2. **Real-time Updates**: `onAuthStateChanged` for auth state
3. **Batch Operations**: Used for bulk deletions and batch profile fetching (gallery N+1 fix)
4. **Server Timestamps**: `FieldValue.serverTimestamp()` for consistency
5. **Modular Admin Imports**: `FieldValue` must be imported from `firebase-admin/firestore`

### Security Patterns
1. **Authentication Required**: Most write operations require auth
2. **Owner-only Operations**: Users can only modify their own content
3. **Public/Private Separation**: Clear distinction in data access
4. **API Key Protection**: Claude API key stored in Firebase secrets (`functions:secrets:set`)
5. **XSS Prevention**: `escapeHtml()` utility applied to all user-generated content in innerHTML
6. **Likes Protection**: `likes`/`likedBy` fields locked in Firestore rules — only modifiable via `toggleLike` Cloud Function

## Development Guidelines

### When Adding Features

1. **Maintain Single-File Structure**: Keep all frontend code in `public/index.html`
2. **Follow Existing Patterns**: Match the current code style and structure
3. **Update Security Rules**: Ensure `firestore.rules` covers new data access
4. **Add Indexes**: Update `firestore-indexes.json` for new queries (note: filename)
5. **Handle Edge Cases**: Loading states, errors, empty states
6. **Add Rate Limiting**: Implement rate limiting for new Cloud Functions
7. **Validate Input**: Always validate and sanitize user input on backend
8. **Use Transactions**: For operations affecting multiple documents
9. **Escape Output**: Use `escapeHtml()` for any user-generated content rendered via innerHTML

### When Modifying Cloud Functions

1. **Use v2 Functions**: Import from `firebase-functions/v2/https`
2. **Use Callable Functions**: Prefer `onCall` for client-callable functions
3. **Validate Input**: Always check authentication and validate data
4. **Error Handling**: Throw Error objects with clear messages
5. **Logging**: Use `console.log` for debugging (visible in Firebase console)
6. **Rate Limiting**: Implement per-user rate limiting (see existing pattern)
7. **Use Modular Imports**: Import from specific Firebase Admin subpackages (e.g., `FieldValue` from `firebase-admin/firestore`)

### UI/UX Principles

1. **Minimalist Design**: Clean, uncluttered interface
2. **Japanese Aesthetic**: Noto Serif JP font, subtle animations
3. **Responsive**: Works on mobile and desktop
4. **Immediate Feedback**: Loading states, success messages
5. **Graceful Degradation**: Non-AI fallback when API unavailable

## Common Tasks

### Adding a New View
1. Add navigation button in the nav section
2. Create view container div with `hidden` class
3. Add to `showView()` function logic
4. Implement view-specific functionality

### Adding a New Cloud Function
1. Add function to `functions/index.js`
2. Use `onCall` from `firebase-functions/v2/https`
3. Check authentication with `request.auth`
4. Implement rate limiting using the existing pattern
5. Return structured data or throw Error objects
6. Run `npm run lint` in functions directory before deploying
7. Update ESLint to fix formatting: `npm run lint -- --fix`

### Modifying Haiku Generation
1. Non-AI: Update `syllableData` and `haikuTemplates`
2. AI: Modify the Claude API prompt in cloud function
3. Update hashtag generation logic if needed

## Testing Checklist

When making changes, verify:
- [ ] Authentication flows (sign up, sign in, sign out)
- [ ] Haiku generation (both AI and non-AI)
- [ ] Save/delete operations
- [ ] Public gallery updates
- [ ] Search functionality
- [ ] Mobile responsiveness
- [ ] Error states and messages
- [ ] Profile updates and username uniqueness
- [ ] Like/unlike functionality
- [ ] Rate limiting (10 requests/minute)
- [ ] Stats update correctly
- [ ] Security rules prevent unauthorized access
- [ ] Firebase deployment successful

## Deployment Notes

1. **Environment Variables**: Set Claude API key via Firebase secrets
   ```bash
   firebase functions:secrets:set CLAUDE_API_KEY
   ```
2. **Indexes**: Deploy Firestore indexes before testing queries
   ```bash
   firebase deploy --only firestore:indexes
   ```
3. **Rules**: Deploy security rules to protect data
4. **Functions**: Test locally with emulators before deploying
5. **Node Version**: Ensure Node.js 20 is installed

## Performance Considerations

1. **Lazy Loading**: Views load content only when accessed
2. **Query Limits**: Gallery limited to 20 most recent haikus
3. **Batch Operations**: Cleanup function uses batching
4. **Caching**: Browser caches static assets via Firebase Hosting

## Current Development Status

### Completed (v2.1)
- Enhanced user profiles with username system
- Voting/liking functionality
- Backend infrastructure for collections and following
- Rate limiting and security improvements
- Dependency updates to latest stable versions
- XSS protection via `escapeHtml()` utility
- Likes/likedBy field protection in Firestore rules
- Auth requirement added to `generateHashtags`
- Batch profile fetching in gallery (N+1 query fix)
- Windows test script (`test-all.ps1`)
- Removed deprecated `@firebase/testing` dependency

### In Progress
See `FUTURE_IMPROVEMENTS.md` for detailed roadmap:
- Activity feed
- Comment system  
- Daily challenges
- Export features
- Advanced search

### Architecture Decisions
- Single HTML file maintained for simplicity
- Modular Firebase Admin SDK adopted
- v2 Cloud Functions API for better performance
- Rate limiting implemented server-side
- Username uniqueness enforced via separate collection