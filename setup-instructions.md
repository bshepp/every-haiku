# Every Haiku - Setup Instructions

**Version**: 2.0 (Updated for Firebase SDK v11, Node.js 20, and social features)

## Project Structure
```
haiku-generator/
├── public/
│   └── index.html          # Main app file (from the HTML artifact)
├── functions/
│   ├── index.js           # Cloud Functions
│   └── package.json       # Functions dependencies
├── firebase.json          # Firebase configuration
├── firestore.rules        # Security rules
├── firestore.indexes.json # Database indexes
└── README.md             # This file
```

## Prerequisites
1. Node.js (v16 or higher)
2. Firebase CLI (`npm install -g firebase-tools`)
3. A Firebase project
4. An Anthropic API key (for Claude AI haikus)

## Setup Steps

### 1. Create a new Firebase project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Follow the setup wizard

### 2. Enable required services
In your Firebase Console:
1. **Authentication**: Enable Email/Password authentication
2. **Firestore Database**: Create a database (start in production mode)
3. **Hosting**: No special setup needed

### 3. Set up your local project
```bash
# Create project directory
mkdir haiku-generator
cd haiku-generator

# Initialize Firebase
firebase login
firebase init

# Select:
# - Firestore
# - Functions
# - Hosting
# - Use existing project (select your project)
# - Accept default options
```

### 4. Copy the provided files
1. Create `public/` directory and save the HTML artifact as `public/index.html`
2. Replace `functions/index.js` with the provided Cloud Functions code
3. Replace `functions/package.json` with the provided package.json
4. Replace `firebase.json` with the provided configuration
5. Replace `firestore.rules` with the provided security rules
6. Replace `firestore.indexes.json` with the provided indexes

### 5. Configure Firebase in your app
In `public/index.html`, replace the Firebase config object with your actual configuration:
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

Find these values in Firebase Console > Project Settings > Your apps > Web app

### 6. Set up Claude API key (for AI haikus)
```bash
# Set the Claude API key as a Firebase function config
firebase functions:secrets:set CLAUDE_API_KEY
```

### 7. Install dependencies
```bash
# Install functions dependencies
cd functions
npm install
cd ..
```

### 8. Deploy indexes first
```bash
# Deploy Firestore indexes (required for queries)
firebase deploy --only firestore:indexes
```

### 9. Deploy everything
```bash
# Deploy all services
firebase deploy

# Or deploy individually:
firebase deploy --only firestore:rules
firebase deploy --only functions
firebase deploy --only hosting
```

## Running Locally
```bash
# Start Firebase emulators
firebase emulators:start

# Your app will be available at http://localhost:5000
```

## Features Implemented

### Core Features (v1.0)
- ✅ AI and non-AI haiku generation
- ✅ User authentication with display names
- ✅ Save haikus to personal collection
- ✅ Search saved haikus
- ✅ Public gallery
- ✅ Copy to clipboard
- ✅ Share to Twitter (X)
- ✅ Hashtag generation
- ✅ Auto-cleanup of unsaved haikus after 30 days
- ✅ Minimalist design

### New Social Features (v2.0)
- ✅ Enhanced user profiles (username, bio, social links)
- ✅ Voting/liking system with real-time updates
- ✅ User statistics tracking
- ✅ Following system (backend ready)
- ✅ Collections system (backend ready)
- ✅ Rate limiting (10 requests/minute)
- ✅ Input validation and XSS protection

## Future Enhancements for Mobile
When ready to build mobile apps:
1. Create a new React Native project
2. Install Firebase SDK for React Native
3. Reuse the Firebase configuration
4. Port the UI components (most logic can be reused)
5. Add platform-specific features (push notifications, etc.)

## AI Options
Currently configured for Claude (Anthropic), but you can easily switch:
- **OpenAI**: Modify the API call in `functions/index.js`
- **Google PaLM**: Use Google's Vertex AI
- **Local model**: Host your own model and call it

## Important Notes

### Security
- All API keys in the code are placeholders - replace with your actual values
- Rate limiting is enforced (10 requests/minute per user)
- Input validation happens on the backend
- Usernames are globally unique and can only be set once

### Dependencies
- Node.js 20 is required for Cloud Functions
- Firebase SDK v11 is used in the frontend
- Firebase Admin SDK v13 uses modular imports
- All security vulnerabilities have been resolved

### Costs
- Firebase free tier is generous for starting
- Monitor Claude API usage (approximately $0.00025 per haiku)
- Consider setting budget alerts in Firebase Console

### Development
- All frontend code is in a single `index.html` file
- ESLint must pass before deploying functions
- Use Firebase emulators for local development
- See `FUTURE_IMPROVEMENTS.md` for planned features