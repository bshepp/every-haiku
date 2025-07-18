# AI Agent Design Guidelines for Every Haiku

## Project Overview

Every Haiku is a Firebase-based web application that generates, manages, and shares haikus. The app features both AI-powered (via Claude API) and template-based haiku generation, with user authentication, personal collections, and a public gallery.

## Architecture Overview

### Technology Stack
- **Frontend**: Vanilla JavaScript with TailwindCSS (single HTML file)
- **Backend**: Firebase Cloud Functions (Node.js 18)
- **Database**: Firestore
- **Authentication**: Firebase Auth (Email/Password)
- **Hosting**: Firebase Hosting
- **AI Integration**: Anthropic Claude API

### Project Structure
```
/
├── public/
│   └── index.html          # Main application (single-page app)
├── functions/
│   ├── index.js           # Cloud Functions backend
│   ├── package.json       # Functions dependencies
│   └── .eslintrc.js       # ESLint configuration
├── firebase.json          # Firebase configuration
├── firestore.rules        # Security rules
├── firestore.indexes.json # Database indexes
├── .gitignore            # Git ignore file
├── README.md             # Project overview
├── requirements.txt      # Project requirements
├── setup-instructions.md # Deployment guide
└── AI_AGENT_GUIDELINES.md # This file
```

## Core Features

1. **Haiku Generation**
   - AI-powered generation using Claude API
   - Template-based non-AI generation (5-7-5 syllable pattern)
   - Theme-based generation support

2. **User Management**
   - Email/password authentication
   - Display name support
   - Personal haiku collections

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
  createdAt: timestamp
}
```

#### `userHaikus/{userId}/saved`
```javascript
{
  haikuRef: string,         // Reference to haiku document
  savedAt: timestamp
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
1. **Compat Library**: Uses Firebase v10 compat for broader compatibility
2. **Real-time Updates**: `onAuthStateChanged` for auth state
3. **Batch Operations**: Used for bulk deletions
4. **Server Timestamps**: `FieldValue.serverTimestamp()` for consistency

### Security Patterns
1. **Authentication Required**: Most write operations require auth
2. **Owner-only Operations**: Users can only modify their own content
3. **Public/Private Separation**: Clear distinction in data access
4. **API Key Protection**: Claude API key stored in Firebase config

## Development Guidelines

### When Adding Features

1. **Maintain Single-File Structure**: Keep all frontend code in `public/index.html`
2. **Follow Existing Patterns**: Match the current code style and structure
3. **Update Security Rules**: Ensure `firestore.rules` covers new data access
4. **Add Indexes**: Update `firestore.indexes.json` for new queries
5. **Handle Edge Cases**: Loading states, errors, empty states

### When Modifying Cloud Functions

1. **Use Callable Functions**: Prefer `https.onCall` for client-callable functions
2. **Validate Input**: Always check authentication and validate data
3. **Error Handling**: Use proper Firebase error codes
4. **Logging**: Use `console.log` for debugging (visible in Firebase console)

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
2. Use `functions.https.onCall` for client access
3. Check authentication with `context.auth`
4. Return structured data or throw proper errors
5. Run `npm run lint` in functions directory before deploying

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
- [ ] Firebase deployment successful

## Deployment Notes

1. **Environment Variables**: Set Claude API key via Firebase config
2. **Indexes**: Deploy Firestore indexes before testing queries
3. **Rules**: Deploy security rules to protect data
4. **Functions**: Test locally with emulators before deploying

## Performance Considerations

1. **Lazy Loading**: Views load content only when accessed
2. **Query Limits**: Gallery limited to 20 most recent haikus
3. **Batch Operations**: Cleanup function uses batching
4. **Caching**: Browser caches static assets via Firebase Hosting

## Future Enhancement Ideas

1. **Mobile Apps**: React Native implementation guide provided
2. **Additional AI Models**: Easy to swap Claude for other APIs
3. **Rich Media**: Support for haiku illustrations
4. **Collaboration**: Shared collections or haiku remixes
5. **Analytics**: Track popular themes and engagement