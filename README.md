# Every Haiku - AI-Powered Haiku Generator

A minimalist web application for generating, saving, and sharing haikus. Features both AI-powered generation using Claude API and template-based generation with traditional 5-7-5 syllable patterns.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-11.x-orange.svg)
![Node](https://img.shields.io/badge/Node.js-20.x-green.svg)
![Status](https://img.shields.io/badge/Status-Beta-yellow.svg)

## Features

### What Works ✅
- 🤖 **AI Generation**: Haikus using Claude API
- 📝 **Template Fallback**: Classic 5-7-5 syllable generation if AI fails
- 🔐 **Authentication**: Email/password with Firebase
- 💾 **Save Haikus**: Keep your favorites
- 🌐 **Gallery**: Browse and like other users' haikus
- 🔍 **Search**: Find your saved haikus
- #️⃣ **Auto-Hashtags**: Automatic social media hashtags
- 🐦 **Share on X**: Direct Twitter/X sharing
- 👤 **User Profiles**: Set username, bio, links
- ❤️ **Likes**: Like other users' haikus
- 📱 **Responsive**: Desktop and mobile compatible

### In Progress ⚠️
- 👥 **Collections**: Backend done, UI not yet implemented
- 📊 **Following**: Backend done, UI not yet implemented
- 📈 **User Stats**: Basic tracking, minimal UI
- 🖼️ **Avatars**: Not yet implemented

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), TailwindCSS v3
- **Backend**: Firebase Cloud Functions v6 (Node.js 20)
- **Database**: Cloud Firestore with advanced indexing
- **Authentication**: Firebase Auth with enhanced user profiles
- **Hosting**: Firebase Hosting
- **AI**: Anthropic Claude API
- **Security**: Rate limiting, input validation, comprehensive security rules

## Project Structure

```
every-haiku/
├── docs/                       # 📚 Documentation
│   ├── README.md              # Doc index (START HERE)
│   ├── QUICK_REFERENCE.md     # Commands & shortcuts
│   ├── CLAUDE.md              # Dev notes
│   ├── setup-instructions.md  # Setup & deploy
│   ├── TESTING.md             # Testing info
│   ├── AI_AGENT_GUIDELINES.md # Dev guidelines
│   └── archived/              # Historical docs
├── public/
│   └── index.html             # Main application (SPA)
├── functions/
│   ├── index.js               # Cloud Functions
│   ├── package.json           # Function dependencies
│   └── __tests__/             # Tests
├── cypress/                    # E2E tests
├── .github/workflows/test.yml # CI/CD pipeline
├── firebase.json              # Firebase config
├── firestore.rules            # Database security
├── package.json               # Root config
└── README.md                  # This file
```

## Documentation

See [docs/README.md](docs/README.md) for all documentation including:
- Quick reference and commands
- Setup and deployment
- Testing guide
- Developer notes
- Historical/archived docs

## Prerequisites

- Node.js (v20 or higher)
- npm (v10 or higher)
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Firestore, Auth, and Functions enabled
- Anthropic API key (for AI haiku generation)
- Git for version control

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/bshepp/every-haiku.git
   cd every-haiku
   ```

2. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Login to Firebase**
   ```bash
   firebase login
   ```

4. **Initialize Firebase project**
   ```bash
   firebase init
   # Select: Firestore, Functions, Hosting
   # Use existing project or create new
   ```

5. **Install dependencies**
   ```bash
   cd functions
   npm install
   cd ..
   ```

6. **Configure Firebase**
   - Update Firebase config in `public/index.html` with your project credentials
   - Get credentials from Firebase Console > Project Settings

7. **Set Claude API key**
   ```bash
   firebase functions:secrets:set CLAUDE_API_KEY
   ```

9. **Deploy Firestore indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

8. **Deploy**
   ```bash
   firebase deploy
   ```

## Development

### Run locally with emulators
```bash
firebase emulators:start
```
Your app will be available at http://localhost:5000

### Deploy individual components
```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Testing

The project includes a comprehensive testing framework with unit, integration, and end-to-end tests.

### Test Stack
- **Unit Tests**: Jest for Cloud Functions
- **Integration Tests**: Firebase Emulator + Jest for Firestore rules
- **E2E Tests**: Cypress for user flows

### Quick Test Commands
```bash
# Run all tests
./test-all.sh

# Run unit tests
cd functions && npm test

# Run E2E tests
npx cypress open

# Run tests with coverage
cd functions && npm run test:coverage
```

See `TESTING.md` for detailed testing documentation.

## Configuration

⚠️ **IMPORTANT**: Never commit real API keys or credentials to version control. The configuration below uses placeholder values that must be replaced with your actual Firebase project credentials.

### Firebase Configuration
Update the Firebase config object in `public/index.html`:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Environment Variables
Set the Claude API key for AI generation:
```bash
firebase functions:config:set claude.api_key="YOUR_KEY"
```

## API Endpoints (Cloud Functions)

### Content Generation
- `generateAIHaiku`: Generate AI-powered haiku using Claude (with rate limiting)
- `generateHashtags`: Generate relevant hashtags for haikus

### User Management
- `updateProfile`: Update user profile information
- `getUserStats`: Get comprehensive user statistics

### Social Features
- `toggleLike`: Like or unlike a haiku
- `toggleFollow`: Follow or unfollow a user
- `createCollection`: Create a new haiku collection
- `addToCollection`: Add haiku to a collection

### Maintenance
- `cleanupOldHaikus`: Scheduled function to delete old unsaved haikus

## Security

- Authentication required for saving haikus and social features
- Users can only modify their own content
- Public haikus and profiles visible to all users
- API keys stored securely using Firebase secrets
- Comprehensive Firestore security rules with granular access control
- Rate limiting on all API endpoints (10 requests/minute)
- Input validation and sanitization
- XSS protection in frontend
- Username uniqueness enforcement

## Project Status

This project is currently in **Beta**. Core features are complete and stable. See `FUTURE_IMPROVEMENTS.md` for the roadmap of upcoming features.

### Recent Updates (v2.0)
- Enhanced user profiles with social features
- Voting/liking system
- Collections infrastructure
- Major dependency updates (Firebase SDK v11, Admin SDK v13)
- Security improvements

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read:
- `AI_AGENT_GUIDELINES.md` for development guidelines
- `FUTURE_IMPROVEMENTS.md` for planned features
- `MIGRATION_GUIDE.md` for dependency update information

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Anthropic for Claude API
- Firebase team for the excellent platform
- The haiku poetry tradition for inspiration

## Support

For issues, questions, or contributions, please open an issue on GitHub.