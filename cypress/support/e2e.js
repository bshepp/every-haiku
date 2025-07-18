// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Firebase emulator configuration
Cypress.on('window:before:load', (win) => {
  // Connect to Firebase emulators
  win.USE_FIREBASE_EMULATOR = true;
  win.FIREBASE_AUTH_EMULATOR_HOST = Cypress.env('FIREBASE_AUTH_EMULATOR_HOST');
  win.FIRESTORE_EMULATOR_HOST = Cypress.env('FIRESTORE_EMULATOR_HOST');
});

// Disable uncaught exception handling for better debugging
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the error from failing the test
  console.error('Uncaught exception:', err);
  return false;
});

// Add custom logging for debugging
Cypress.on('log:added', (log) => {
  if (log.get('error')) {
    console.error('Test error:', log.get('error'));
  }
});