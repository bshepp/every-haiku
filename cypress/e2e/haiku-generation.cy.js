describe('Haiku Generation', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForFirebase();
  });

  describe('Manual Haiku Creation', () => {
    beforeEach(() => {
      cy.createTestUser('haikutest@example.com', 'testPassword123!', 'Haiku Test User');
    });

    afterEach(() => {
      cy.logout();
    });

    it('should create a manual haiku with all fields', () => {
      // Fill haiku form
      cy.get('#line1').type('Morning dew glistens');
      cy.get('#line2').type('On petals of the roses');
      cy.get('#line3').type('Nature awakens');
      cy.get('#theme-input').clear().type('nature');
      
      // Generate hashtags
      cy.contains('Generate Hashtags').click();
      cy.get('.hashtag').should('have.length.at.least', 1);
      
      // Create haiku
      cy.contains('Create Haiku').click();
      
      // Verify haiku is displayed
      cy.get('.haiku-card').should('be.visible');
      cy.assertHaikuContent('.haiku-card', [
        'Morning dew glistens',
        'On petals of the roses',
        'Nature awakens'
      ]);
      cy.assertHaikuStats('.haiku-card', {
        author: 'Haiku Test User',
        theme: 'nature'
      });
    });

    it('should validate syllable count for haiku', () => {
      // Try invalid syllable count
      cy.get('#line1').type('This line has way too many syllables for a haiku');
      cy.get('#line2').type('Second line');
      cy.get('#line3').type('Third');
      
      cy.contains('Create Haiku').click();
      
      // Should show validation message
      cy.contains('follow the 5-7-5 syllable pattern').should('be.visible');
    });

    it('should require all lines to be filled', () => {
      cy.get('#line1').type('First line only');
      // Leave line2 and line3 empty
      
      cy.contains('Create Haiku').click();
      
      // Should show validation
      cy.get('#line2:invalid').should('exist');
      cy.get('#line3:invalid').should('exist');
    });

    it('should clear form after successful creation', () => {
      cy.get('#line1').type('Clear form test one');
      cy.get('#line2').type('Testing form clearing now');
      cy.get('#line3').type('Should be empty');
      
      cy.contains('Create Haiku').click();
      
      // Verify form is cleared
      cy.get('#line1').should('have.value', '');
      cy.get('#line2').should('have.value', '');
      cy.get('#line3').should('have.value', '');
    });
  });

  describe('AI Haiku Generation', () => {
    beforeEach(() => {
      cy.createTestUser('aitest@example.com', 'testPassword123!', 'AI Test User');
    });

    afterEach(() => {
      cy.logout();
    });

    it('should generate AI haiku with theme', () => {
      cy.get('#theme-input').clear().type('ocean');
      cy.get('#generate-btn').click();
      
      // Wait for AI generation
      cy.get('.loading-indicator').should('be.visible');
      cy.get('.haiku-card', { timeout: 20000 }).should('be.visible');
      
      // Verify AI haiku
      cy.get('.haiku-card').should('contain', 'AI');
      cy.assertHaikuStats('.haiku-card', {
        theme: 'ocean',
        author: 'AI Test User'
      });
    });

    it('should handle API errors gracefully', () => {
      // Intercept API call to simulate error
      cy.intercept('POST', '**/generateAIHaiku', {
        statusCode: 500,
        body: { error: 'API Error' }
      });
      
      cy.get('#theme-input').clear().type('error test');
      cy.get('#generate-btn').click();
      
      // Should show error message
      cy.contains('Failed to generate AI haiku').should('be.visible');
    });

    it('should disable generate button during request', () => {
      // Intercept API call with delay
      cy.intercept('POST', '**/generateAIHaiku', (req) => {
        req.reply((res) => {
          res.delay(1000);
          res.send({ haiku: 'Delayed haiku here\nTesting button disabled state\nShould work properly' });
        });
      });
      
      cy.get('#theme-input').clear().type('slow');
      cy.get('#generate-btn').click();
      
      // Button should be disabled
      cy.get('#generate-btn').should('be.disabled');
      cy.get('.loading-indicator').should('be.visible');
      
      // Wait for completion
      cy.get('.haiku-card', { timeout: 5000 }).should('be.visible');
      cy.get('#generate-btn').should('not.be.disabled');
    });

    it('should handle rate limiting', () => {
      // Make multiple rapid requests
      const requests = 11; // Assuming rate limit is 10
      
      for (let i = 0; i < requests; i++) {
        cy.get('#theme-input').clear().type(`theme${i}`);
        cy.get('#generate-btn').click();
        
        if (i < 10) {
          cy.get('.haiku-card').should('be.visible');
        }
      }
      
      // Last request should show rate limit error
      cy.contains('Rate limit exceeded').should('be.visible');
    });
  });

  describe('Haiku Display Features', () => {
    beforeEach(() => {
      cy.createTestUser('display@example.com', 'testPassword123!', 'Display User');
    });

    afterEach(() => {
      cy.logout();
    });

    it('should save and unsave haiku', () => {
      cy.generateHaiku('test');
      
      // Save haiku
      cy.get('#save-btn').click();
      cy.get('.haiku-card').should('have.class', 'saved');
      cy.contains('Saved!').should('be.visible');
      
      // Unsave haiku
      cy.get('#save-btn').click();
      cy.get('.haiku-card').should('not.have.class', 'saved');
      cy.contains('Save').should('be.visible');
    });

    it('should toggle haiku visibility', () => {
      cy.generateHaiku('private');
      cy.saveHaiku();
      
      // Should be private by default
      cy.get('.visibility-icon').should('have.class', 'private');
      
      // Toggle to public
      cy.toggleHaikuVisibility();
      cy.get('.visibility-icon').should('have.class', 'public');
      cy.contains('Public').should('be.visible');
      
      // Toggle back to private
      cy.toggleHaikuVisibility();
      cy.get('.visibility-icon').should('have.class', 'private');
      cy.contains('Private').should('be.visible');
    });

    it('should like and unlike haiku', () => {
      cy.generateHaiku('likeable');
      cy.saveHaiku();
      
      // Initial state
      cy.get('.likes-count').should('contain', '0');
      
      // Like haiku
      cy.likeHaiku('.haiku-card');
      cy.get('.like-btn').should('have.class', 'liked');
      cy.get('.likes-count').should('contain', '1');
      
      // Unlike haiku
      cy.likeHaiku('.haiku-card');
      cy.get('.like-btn').should('not.have.class', 'liked');
      cy.get('.likes-count').should('contain', '0');
    });

    it('should display creation timestamp', () => {
      cy.generateHaiku('timestamp');
      
      // Check timestamp format
      cy.get('.timestamp').should('be.visible');
      cy.get('.timestamp').invoke('text').should('match', /\d{1,2}\/\d{1,2}\/\d{4}/);
    });

    it('should show hashtags', () => {
      cy.generateHaiku('hashtag test');
      
      // Generate hashtags
      cy.contains('Generate Hashtags').click();
      
      // Verify hashtags
      cy.get('.hashtag').should('have.length.at.least', 1);
      cy.get('.hashtag').first().should('contain', '#');
    });
  });

  describe('Haiku Theme Suggestions', () => {
    it('should show theme suggestions on input', () => {
      cy.get('#theme-input').type('na');
      
      // Should show suggestions
      cy.get('.theme-suggestions').should('be.visible');
      cy.get('.theme-suggestion').should('contain', 'nature');
    });

    it('should select theme from suggestions', () => {
      cy.get('#theme-input').type('lo');
      cy.get('.theme-suggestion').contains('love').click();
      
      // Theme input should be updated
      cy.get('#theme-input').should('have.value', 'love');
      cy.get('.theme-suggestions').should('not.exist');
    });

    it('should hide suggestions on blur', () => {
      cy.get('#theme-input').type('su');
      cy.get('.theme-suggestions').should('be.visible');
      
      // Click outside
      cy.get('body').click(0, 0);
      cy.get('.theme-suggestions').should('not.exist');
    });
  });

  describe('Haiku Validation', () => {
    beforeEach(() => {
      cy.createTestUser('validate@example.com', 'testPassword123!', 'Validate User');
    });

    afterEach(() => {
      cy.logout();
    });

    it('should sanitize HTML in haiku content', () => {
      cy.get('#line1').type('<script>alert("xss")</script>');
      cy.get('#line2').type('Normal line here now');
      cy.get('#line3').type('<b>Bold text</b>');
      
      cy.contains('Create Haiku').click();
      
      // Verify sanitization
      cy.get('.haiku-card').should('not.contain', '<script>');
      cy.get('.haiku-card').should('not.contain', '<b>');
      cy.get('.haiku-line').first().should('contain', 'alert("xss")');
    });

    it('should limit theme length', () => {
      const longTheme = 'a'.repeat(100);
      cy.get('#theme-input').clear().type(longTheme);
      
      cy.generateHaiku(longTheme);
      
      // Theme should be truncated
      cy.get('.theme-tag').invoke('text').then((text) => {
        expect(text.length).to.be.lessThan(60);
      });
    });

    it('should handle special characters in theme', () => {
      cy.get('#theme-input').clear().type('nature & beauty!');
      cy.generateHaiku('nature & beauty!');
      
      // Should handle special characters
      cy.get('.theme-tag').should('contain', 'nature & beauty!');
    });
  });
});