describe('Gallery', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForFirebase();
    cy.createTestUser('gallery@example.com', 'testPassword123!', 'Gallery User');
  });

  afterEach(() => {
    cy.logout();
  });

  describe('Gallery Access', () => {
    it('should require authentication to view gallery', () => {
      cy.logout();
      
      // Try to access gallery without login
      cy.contains('Gallery').click();
      
      // Should prompt login
      cy.contains('Please login to view your gallery').should('be.visible');
      cy.get('#auth-modal').should('be.visible');
    });

    it('should show empty gallery for new users', () => {
      cy.contains('Gallery').click();
      
      // Should show empty state
      cy.contains('Your gallery is empty').should('be.visible');
      cy.contains('Create your first haiku').should('be.visible');
    });
  });

  describe('Gallery Management', () => {
    beforeEach(() => {
      // Create test haikus
      const haikus = [
        { line1: 'Morning sun rises', line2: 'Birds sing their cheerful songs', line3: 'New day begins now', theme: 'morning' },
        { line1: 'Ocean waves crash down', line2: 'Seagulls dance above the foam', line3: 'Peace found by the shore', theme: 'ocean' },
        { line1: 'Cherry blossoms fall', line2: 'Pink petals drift on the breeze', line3: 'Spring beauty fades fast', theme: 'spring' },
      ];

      haikus.forEach(haiku => {
        cy.get('#line1').clear().type(haiku.line1);
        cy.get('#line2').clear().type(haiku.line2);
        cy.get('#line3').clear().type(haiku.line3);
        cy.get('#theme-input').clear().type(haiku.theme);
        cy.contains('Create Haiku').click();
        cy.saveHaiku();
        cy.wait(500); // Ensure saves are processed
      });
    });

    it('should display all saved haikus in gallery', () => {
      cy.contains('Gallery').click();
      
      // Should show all saved haikus
      cy.get('.gallery-haiku').should('have.length', 3);
      cy.contains('Morning sun rises').should('be.visible');
      cy.contains('Ocean waves crash down').should('be.visible');
      cy.contains('Cherry blossoms fall').should('be.visible');
    });

    it('should filter gallery by theme', () => {
      cy.contains('Gallery').click();
      
      // Filter by theme
      cy.get('#gallery-theme-filter').select('ocean');
      
      // Should show only ocean themed haiku
      cy.get('.gallery-haiku').should('have.length', 1);
      cy.contains('Ocean waves crash down').should('be.visible');
      cy.contains('Morning sun rises').should('not.exist');
    });

    it('should sort gallery by date', () => {
      cy.contains('Gallery').click();
      
      // Sort newest first (default)
      cy.get('#gallery-sort').select('newest');
      cy.get('.gallery-haiku').first().should('contain', 'Cherry blossoms fall');
      
      // Sort oldest first
      cy.get('#gallery-sort').select('oldest');
      cy.get('.gallery-haiku').first().should('contain', 'Morning sun rises');
    });

    it('should delete haiku from gallery', () => {
      cy.contains('Gallery').click();
      
      // Delete first haiku
      cy.get('.gallery-haiku').first().within(() => {
        cy.get('.delete-btn').click();
      });
      
      // Confirm deletion
      cy.contains('Confirm Delete').click();
      
      // Verify deletion
      cy.contains('Haiku deleted').should('be.visible');
      cy.get('.gallery-haiku').should('have.length', 2);
      cy.contains('Morning sun rises').should('not.exist');
    });

    it('should edit haiku visibility from gallery', () => {
      cy.contains('Gallery').click();
      
      // Toggle visibility of first haiku
      cy.get('.gallery-haiku').first().within(() => {
        cy.get('.visibility-toggle').click();
      });
      
      // Should update visibility
      cy.get('.gallery-haiku').first().find('.visibility-icon').should('have.class', 'public');
      
      // Toggle back
      cy.get('.gallery-haiku').first().within(() => {
        cy.get('.visibility-toggle').click();
      });
      cy.get('.gallery-haiku').first().find('.visibility-icon').should('have.class', 'private');
    });

    it('should show haiku details modal', () => {
      cy.contains('Gallery').click();
      
      // Click on haiku to view details
      cy.get('.gallery-haiku').first().click();
      
      // Should show modal with details
      cy.get('.haiku-detail-modal').should('be.visible');
      cy.get('.haiku-detail-modal').within(() => {
        cy.contains('Morning sun rises').should('be.visible');
        cy.contains('Created on').should('be.visible');
        cy.contains('Theme: morning').should('be.visible');
        cy.get('.likes-count').should('be.visible');
      });
      
      // Close modal
      cy.get('.modal-close').click();
      cy.get('.haiku-detail-modal').should('not.exist');
    });
  });

  describe('Gallery Statistics', () => {
    beforeEach(() => {
      // Create various haikus with different properties
      for (let i = 0; i < 5; i++) {
        cy.generateHaiku(`theme${i % 3}`);
        cy.saveHaiku();
        if (i % 2 === 0) {
          cy.toggleHaikuVisibility(); // Make some public
        }
      }
    });

    it('should display gallery statistics', () => {
      cy.contains('Gallery').click();
      
      // Check statistics section
      cy.get('.gallery-stats').within(() => {
        cy.contains('Total Haikus: 5').should('be.visible');
        cy.contains('Public: 3').should('be.visible');
        cy.contains('Private: 2').should('be.visible');
        cy.contains('AI Generated:').should('be.visible');
      });
    });

    it('should show theme distribution', () => {
      cy.contains('Gallery').click();
      
      // Check theme breakdown
      cy.contains('View Theme Distribution').click();
      cy.get('.theme-chart').should('be.visible');
      cy.contains('theme0: 2').should('be.visible');
      cy.contains('theme1: 2').should('be.visible');
      cy.contains('theme2: 1').should('be.visible');
    });
  });

  describe('Gallery Export', () => {
    beforeEach(() => {
      // Create haikus for export
      cy.generateHaiku('export test 1');
      cy.saveHaiku();
      cy.generateHaiku('export test 2');
      cy.saveHaiku();
    });

    it('should export gallery as JSON', () => {
      cy.contains('Gallery').click();
      cy.contains('Export').click();
      cy.contains('Export as JSON').click();
      
      // Verify download
      cy.readFile('cypress/downloads/haiku-gallery.json').should('exist');
    });

    it('should export gallery as CSV', () => {
      cy.contains('Gallery').click();
      cy.contains('Export').click();
      cy.contains('Export as CSV').click();
      
      // Verify download
      cy.readFile('cypress/downloads/haiku-gallery.csv').should('exist');
    });

    it('should export gallery as PDF', () => {
      cy.contains('Gallery').click();
      cy.contains('Export').click();
      cy.contains('Export as PDF').click();
      
      // Should show PDF preview
      cy.get('.pdf-preview-modal').should('be.visible');
      cy.contains('Download PDF').click();
      
      // Verify download
      cy.readFile('cypress/downloads/haiku-gallery.pdf').should('exist');
    });
  });

  describe('Gallery Search', () => {
    beforeEach(() => {
      // Create searchable haikus
      const searchableHaikus = [
        { content: 'Sunset paints the sky', theme: 'evening' },
        { content: 'Mountains stand so tall', theme: 'nature' },
        { content: 'River flows gently', theme: 'water' },
      ];

      searchableHaikus.forEach(haiku => {
        cy.generateHaiku(haiku.theme);
        cy.saveHaiku();
      });
    });

    it('should search haikus by content', () => {
      cy.contains('Gallery').click();
      
      // Search for specific word
      cy.get('#gallery-search').type('mountains');
      cy.get('#search-gallery-btn').click();
      
      // Should show matching haiku
      cy.get('.gallery-haiku').should('have.length', 1);
      cy.contains('Mountains stand so tall').should('be.visible');
    });

    it('should clear search results', () => {
      cy.contains('Gallery').click();
      
      // Perform search
      cy.get('#gallery-search').type('river');
      cy.get('#search-gallery-btn').click();
      cy.get('.gallery-haiku').should('have.length', 1);
      
      // Clear search
      cy.get('#clear-search-btn').click();
      cy.get('.gallery-haiku').should('have.length', 3);
      cy.get('#gallery-search').should('have.value', '');
    });

    it('should show no results message', () => {
      cy.contains('Gallery').click();
      
      // Search for non-existent content
      cy.get('#gallery-search').type('nonexistent');
      cy.get('#search-gallery-btn').click();
      
      // Should show no results
      cy.contains('No haikus found matching your search').should('be.visible');
    });
  });

  describe('Batch Operations', () => {
    beforeEach(() => {
      // Create multiple haikus
      for (let i = 0; i < 5; i++) {
        cy.generateHaiku(`batch test ${i}`);
        cy.saveHaiku();
      }
    });

    it('should select multiple haikus', () => {
      cy.contains('Gallery').click();
      
      // Enable selection mode
      cy.contains('Select').click();
      
      // Select first 3 haikus
      cy.get('.gallery-haiku').eq(0).find('.select-checkbox').check();
      cy.get('.gallery-haiku').eq(1).find('.select-checkbox').check();
      cy.get('.gallery-haiku').eq(2).find('.select-checkbox').check();
      
      // Should show selection count
      cy.contains('3 selected').should('be.visible');
    });

    it('should batch delete haikus', () => {
      cy.contains('Gallery').click();
      cy.contains('Select').click();
      
      // Select 2 haikus
      cy.get('.gallery-haiku').eq(0).find('.select-checkbox').check();
      cy.get('.gallery-haiku').eq(1).find('.select-checkbox').check();
      
      // Batch delete
      cy.contains('Delete Selected').click();
      cy.contains('Confirm Delete 2 Haikus').click();
      
      // Verify deletion
      cy.contains('2 haikus deleted').should('be.visible');
      cy.get('.gallery-haiku').should('have.length', 3);
    });

    it('should batch update visibility', () => {
      cy.contains('Gallery').click();
      cy.contains('Select').click();
      
      // Select all haikus
      cy.contains('Select All').click();
      
      // Make all public
      cy.contains('Make Selected Public').click();
      
      // Verify update
      cy.contains('5 haikus updated').should('be.visible');
      cy.get('.gallery-haiku .visibility-icon.public').should('have.length', 5);
    });
  });
});