# Changelog

All notable changes to Every Haiku will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-02-12

### Added
- Authentication requirement on `generateHashtags` Cloud Function
- `escapeHtml()` utility function for XSS protection on all user-generated content
- `test-all.ps1` Windows PowerShell test runner (equivalent of `test-all.sh`)
- Batch user profile fetching in gallery to eliminate N+1 queries
- Unit tests for `generateHashtags` function
- Integration tests for likes/likedBy immutability rule
- `createHaikuElement` now accepts optional `userMap` parameter for pre-fetched profiles

### Fixed
- Critical bug: `FieldValue` not imported from `firebase-admin/firestore` (broke 5 of 8 Cloud Functions)
- `loadSavedHaikus` using `doc.data().haikuRef` instead of `doc.id` (saved haikus failed to load)
- Broken `@firebase/testing` import in integration test file

### Security
- Firestore rules now prevent client-side manipulation of `likes` and `likedBy` fields on haikus
- Only `toggleLike` Cloud Function (running with admin privileges) can modify like data

### Removed
- Deprecated `@firebase/testing` package from devDependencies (replaced by `@firebase/rules-unit-testing`)

## [2.0.0] - 2025-07-18

### Added
- Enhanced user profiles with unique username system
- Bio, website, and social media links in profiles
- Voting/liking system for haikus with real-time updates
- User statistics tracking (haikus, likes, followers, following)
- Following/followers system (backend infrastructure)
- Collections system for organizing haikus (backend infrastructure)
- Profile management UI
- Rate limiting on all Cloud Functions (10 requests/minute)
- Input validation and sanitization
- XSS protection in frontend
- Author information display on haikus
- Comprehensive Firestore security rules for new features
- Database indexes for efficient queries
- Complete testing framework with Jest and Cypress
- Unit tests for all Cloud Functions
- Integration tests for Firestore security rules
- End-to-end tests for user flows
- Test coverage reporting
- Automated test runner script

### Changed
- Updated Firebase JS SDK from 10.7.1 to 11.10.0
- Updated Firebase Admin SDK from 11.8.0 to 13.4.0 (breaking: modular API)
- Updated Firebase Functions from 4.3.1 to 6.4.0 (breaking: v2 API)
- Updated Node.js requirement from 18 to 20 LTS
- Migrated from `functions.config()` to environment variables
- Enhanced user data model with social features
- Improved haiku display with author info and interaction buttons
- Updated all documentation to reflect new features

### Fixed
- Critical protobufjs security vulnerability in firebase-admin
- Duplicate haiku creation when saving/making public
- Missing connection between AI generation and Cloud Function
- Hashtag generation not being called
- All ESLint errors in Cloud Functions

### Security
- Added rate limiting to prevent API abuse
- Implemented input validation on all endpoints
- Added XSS protection in frontend rendering
- Enhanced Firestore security rules
- Username uniqueness enforcement

## [1.0.0] - 2025-07-18

### Initial Release
- AI-powered haiku generation using Claude API
- Template-based non-AI generation (5-7-5 syllable pattern)
- User authentication with Firebase Auth
- Personal haiku collections
- Public gallery for sharing
- Search functionality
- Hashtag generation
- Twitter/X sharing integration
- Copy to clipboard
- Auto-cleanup of unsaved haikus after 30 days
- Responsive design with TailwindCSS
- Single-page application architecture