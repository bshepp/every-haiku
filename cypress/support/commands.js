// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Firebase Authentication commands
Cypress.Commands.add('loginWithEmail', (email, password) => {
  cy.window().then((win) => {
    const auth = win.firebase.auth();
    return auth.signInWithEmailAndPassword(email, password);
  });
});

Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    const auth = win.firebase.auth();
    return auth.signOut();
  });
});

Cypress.Commands.add('createTestUser', (email, password, displayName) => {
  cy.window().then((win) => {
    const auth = win.firebase.auth();
    const db = win.firebase.firestore();
    
    return auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Create user profile in Firestore
        return db.collection('users').doc(userCredential.user.uid).set({
          displayName: displayName,
          username: null,
          bio: '',
          avatarUrl: '',
          website: '',
          socialLinks: {
            twitter: '',
            instagram: ''
          },
          stats: {
            totalHaikus: 0,
            totalLikes: 0,
            totalFollowers: 0,
            totalFollowing: 0
          },
          preferences: {
            defaultPublic: false,
            emailNotifications: true
          },
          createdAt: win.firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: win.firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => userCredential);
      });
  });
});

// Firestore commands
Cypress.Commands.add('clearFirestore', () => {
  cy.task('clearFirestore');
});

Cypress.Commands.add('seedDatabase', (data) => {
  cy.task('seedDatabase', data);
});

// UI interaction commands
Cypress.Commands.add('generateHaiku', (theme) => {
  cy.get('#theme-input').clear().type(theme);
  cy.get('#generate-btn').click();
  cy.get('.haiku-card', { timeout: 20000 }).should('be.visible');
});

Cypress.Commands.add('saveHaiku', () => {
  cy.get('#save-btn').click();
  cy.get('.haiku-card').should('have.class', 'saved');
});

Cypress.Commands.add('toggleHaikuVisibility', () => {
  cy.get('#toggle-visibility-btn').click();
});

Cypress.Commands.add('likeHaiku', (haikuSelector) => {
  cy.get(haikuSelector).find('.like-btn').click();
});

// Assertion commands
Cypress.Commands.add('assertHaikuContent', (haikuSelector, expectedLines) => {
  cy.get(haikuSelector).within(() => {
    expectedLines.forEach((line, index) => {
      cy.get('.haiku-line').eq(index).should('contain', line);
    });
  });
});

Cypress.Commands.add('assertHaikuStats', (haikuSelector, stats) => {
  cy.get(haikuSelector).within(() => {
    if (stats.likes !== undefined) {
      cy.get('.likes-count').should('contain', stats.likes);
    }
    if (stats.author !== undefined) {
      cy.get('.author-name').should('contain', stats.author);
    }
    if (stats.theme !== undefined) {
      cy.get('.theme-tag').should('contain', stats.theme);
    }
  });
});

// Wait for Firebase to be ready
Cypress.Commands.add('waitForFirebase', () => {
  cy.window().should('have.property', 'firebase');
  cy.window().then((win) => {
    return new Cypress.Promise((resolve) => {
      const unsubscribe = win.firebase.auth().onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });
    });
  });
});