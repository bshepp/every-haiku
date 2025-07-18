/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK for test cleanup
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require('../../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'test-project'
});

const db = admin.firestore();

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on, config) => {
  // implement node event listeners here
  
  on('task', {
    // Clear Firestore collections
    async clearFirestore() {
      const collections = ['users', 'haikus', 'usernames', 'likes', 'follows', 'collections'];
      
      const deletePromises = collections.map(async (collectionName) => {
        const collection = db.collection(collectionName);
        const snapshot = await collection.get();
        
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        return batch.commit();
      });
      
      await Promise.all(deletePromises);
      return null;
    },
    
    // Seed database with test data
    async seedDatabase(data) {
      const batch = db.batch();
      
      Object.entries(data).forEach(([collection, documents]) => {
        Object.entries(documents).forEach(([docId, docData]) => {
          const ref = db.collection(collection).doc(docId);
          batch.set(ref, docData);
        });
      });
      
      await batch.commit();
      return null;
    },
    
    // Log messages from tests
    log(message) {
      console.log(message);
      return null;
    },
    
    // Check if file exists (for download tests)
    fileExists(filePath) {
      const fs = require('fs');
      return fs.existsSync(filePath);
    },
    
    // Delete downloaded files (cleanup)
    deleteDownloads() {
      const fs = require('fs');
      const path = require('path');
      const downloadsFolder = path.join(__dirname, '../../cypress/downloads');
      
      if (fs.existsSync(downloadsFolder)) {
        fs.readdirSync(downloadsFolder).forEach(file => {
          fs.unlinkSync(path.join(downloadsFolder, file));
        });
      }
      
      return null;
    }
  });
  
  // Configure downloads folder
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.family === 'chromium') {
      launchOptions.preferences.default['download'] = {
        default_directory: require('path').join(__dirname, '../../cypress/downloads')
      };
    }
    return launchOptions;
  });
  
  return config;
};