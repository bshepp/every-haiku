# Every Haiku - AI-Powered Haiku Generator

A minimalist web application for generating, saving, and sharing haikus. Features both AI-powered generation using Claude API and template-based generation with traditional 5-7-5 syllable patterns.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Firebase](https://img.shields.io/badge/Firebase-11.x-orange.svg)
![Node](https://img.shields.io/badge/Node.js-20.x-green.svg)

## Features

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

## Tech Stack

- **Frontend**: Vanilla JavaScript, TailwindCSS
- **Backend**: Firebase Cloud Functions (Node.js 20)
- **Database**: Cloud Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **AI**: Anthropic Claude API

## Project Structure

```
every-haiku/
├── public/
│   └── index.html          # Main application (SPA)
├── functions/
│   ├── index.js           # Cloud Functions
│   ├── package.json       # Function dependencies
│   └── .eslintrc.js       # ESLint configuration
├── firebase.json          # Firebase configuration
├── firestore.rules        # Security rules
├── firestore.indexes.json # Database indexes
├── .gitignore            # Git ignore file
├── README.md             # This file
├── requirements.txt      # Project requirements
├── setup-instructions.md # Detailed setup guide
└── AI_AGENT_GUIDELINES.md # Guidelines for AI developers
```

## Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project
- Anthropic API key (for AI haiku generation)

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

- `generateAIHaiku`: Generate AI-powered haiku using Claude
- `generateHashtags`: Generate relevant hashtags for haikus
- `getUserStats`: Get user statistics (total, saved, public haikus)
- `cleanupOldHaikus`: Scheduled function to delete old unsaved haikus

## Security

- Authentication required for saving haikus
- Users can only modify their own content
- Public haikus visible to all users
- API keys stored securely in Firebase config
- Comprehensive Firestore security rules

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read `AI_AGENT_GUIDELINES.md` for detailed development guidelines.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Anthropic for Claude API
- Firebase team for the excellent platform
- The haiku poetry tradition for inspiration

## Support

For issues, questions, or contributions, please open an issue on GitHub.