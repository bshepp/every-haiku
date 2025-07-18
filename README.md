# Every Haiku - AI-Powered Haiku Generator

A minimalist web application for generating, saving, and sharing haikus. Features both AI-powered generation using Claude API and template-based generation with traditional 5-7-5 syllable patterns.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-11.x-orange.svg)
![Node](https://img.shields.io/badge/Node.js-20.x-green.svg)
![Status](https://img.shields.io/badge/Status-Beta-yellow.svg)

## Features

### Core Features
- 🤖 **AI-Powered Generation**: Generate creative haikus using Anthropic's Claude API
- 📝 **Template-Based Generation**: Classic haiku generation following 5-7-5 syllable pattern
- 🔐 **User Authentication**: Secure email/password authentication with Firebase
- 💾 **Personal Collections**: Save your favorite haikus to your personal collection
- 🌐 **Public Gallery**: Share haikus publicly and browse community creations
- 🔍 **Search Functionality**: Search through your saved haikus
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- #️⃣ **Auto-Hashtags**: Automatic hashtag generation for social sharing
- 🐦 **Twitter Integration**: Share haikus directly to Twitter/X
- 🧹 **Auto-Cleanup**: Automatic deletion of unsaved haikus after 30 days

### New Social Features (v2.0)
- 👤 **Enhanced User Profiles**: Customizable profiles with username, bio, website, and social links
- ❤️ **Voting System**: Like and appreciate haikus from other users
- 👥 **Following System**: Follow your favorite haiku creators (infrastructure ready)
- 📚 **Collections**: Organize haikus into themed collections (backend ready)
- 📊 **User Statistics**: Track your haikus, likes, followers, and following
- 🔒 **Enhanced Security**: Rate limiting and input validation on all endpoints

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
├── public/
│   └── index.html              # Main application (SPA)
├── functions/
│   ├── index.js               # Cloud Functions (v2 API)
│   ├── package.json           # Function dependencies
│   ├── jest.config.js         # Jest test configuration
│   ├── .eslintrc.js           # ESLint configuration
│   └── __tests__/             # Unit and integration tests
├── cypress/
│   ├── e2e/                   # End-to-end tests
│   ├── support/               # Test utilities
│   └── plugins/               # Cypress plugins
├── .github/
│   └── workflows/
│       └── test.yml           # CI/CD pipeline
├── firebase.json              # Firebase configuration
├── firestore.rules            # Security rules
├── firestore-indexes.json     # Database indexes
├── cypress.config.js          # Cypress configuration
├── package.json               # Root package configuration
├── test-all.sh               # Test runner script
├── .gitignore                # Git ignore file
├── LICENSE                   # MIT License
└── Documentation/
    ├── README.md             # This file
    ├── CHANGELOG.md          # Version history
    ├── TESTING.md            # Testing guide
    ├── PROJECT_STATUS.md     # Current status
    ├── PROJECT_REVIEW.md     # Comprehensive review
    ├── FUTURE_IMPROVEMENTS.md # Roadmap
    ├── MIGRATION_GUIDE.md    # v1 to v2 guide
    ├── CI_CD_SETUP.md        # CI/CD guide
    ├── setup-instructions.md # Setup guide
    ├── AI_AGENT_GUIDELINES.md # AI dev guidelines
    └── CLAUDE.md             # Claude-specific docs
```

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
   git clone https://github.com/yourusername/every-haiku.git
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