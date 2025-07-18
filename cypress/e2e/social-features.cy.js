describe('Social Features', () => {
  let testUsers = {};

  before(() => {
    // Create test users
    cy.createTestUser('social1@example.com', 'password123!', 'Social User 1')
      .then((user) => { testUsers.user1 = user; });
    cy.createTestUser('social2@example.com', 'password123!', 'Social User 2')
      .then((user) => { testUsers.user2 = user; });
    cy.createTestUser('social3@example.com', 'password123!', 'Social User 3')
      .then((user) => { testUsers.user3 = user; });
  });

  beforeEach(() => {
    cy.visit('/');
    cy.waitForFirebase();
  });

  describe('User Profiles', () => {
    beforeEach(() => {
      cy.loginWithEmail('social1@example.com', 'password123!');
    });

    afterEach(() => {
      cy.logout();
    });

    it('should view own profile', () => {
      cy.get('#user-menu').click();
      cy.contains('Profile').click();
      
      // Verify profile page
      cy.url().should('include', '#profile');
      cy.contains('Social User 1').should('be.visible');
      cy.contains('Edit Profile').should('be.visible');
    });

    it('should edit profile information', () => {
      cy.get('#user-menu').click();
      cy.contains('Profile').click();
      cy.contains('Edit Profile').click();
      
      // Fill profile form
      cy.get('#username').clear().type('socialuser1');
      cy.get('#bio').clear().type('I love writing haikus about nature and life.');
      cy.get('#website').clear().type('https://example.com');
      cy.get('#twitter').clear().type('@socialuser1');
      cy.get('#instagram').clear().type('@social_user_1');
      
      // Save profile
      cy.contains('Save Profile').click();
      
      // Verify updates
      cy.contains('Profile updated successfully').should('be.visible');
      cy.contains('@socialuser1').should('be.visible');
      cy.contains('I love writing haikus').should('be.visible');
    });

    it('should validate username uniqueness', () => {
      // First user sets username
      cy.get('#user-menu').click();
      cy.contains('Profile').click();
      cy.contains('Edit Profile').click();
      cy.get('#username').clear().type('uniqueusername');
      cy.contains('Save Profile').click();
      cy.contains('Profile updated successfully').should('be.visible');
      cy.logout();
      
      // Second user tries same username
      cy.loginWithEmail('social2@example.com', 'password123!');
      cy.get('#user-menu').click();
      cy.contains('Profile').click();
      cy.contains('Edit Profile').click();
      cy.get('#username').clear().type('uniqueusername');
      cy.contains('Save Profile').click();
      
      // Should show error
      cy.contains('Username already taken').should('be.visible');
    });

    it('should display user stats', () => {
      cy.get('#user-menu').click();
      cy.contains('Profile').click();
      
      // Check stats display
      cy.get('.user-stats').within(() => {
        cy.contains('Haikus').should('be.visible');
        cy.contains('Likes').should('be.visible');
        cy.contains('Followers').should('be.visible');
        cy.contains('Following').should('be.visible');
      });
    });

    it('should view other user profiles', () => {
      // Create a public haiku
      cy.generateHaiku('profile test');
      cy.saveHaiku();
      cy.toggleHaikuVisibility(); // Make public
      cy.logout();
      
      // Login as different user
      cy.loginWithEmail('social2@example.com', 'password123!');
      
      // Go to explore/public haikus
      cy.contains('Explore').click();
      
      // Click on author name
      cy.contains('Social User 1').click();
      
      // Should see public profile
      cy.url().should('include', '#profile/');
      cy.contains('Social User 1').should('be.visible');
      cy.contains('Follow').should('be.visible');
      cy.contains('Edit Profile').should('not.exist');
    });
  });

  describe('Following System', () => {
    beforeEach(() => {
      cy.loginWithEmail('social1@example.com', 'password123!');
    });

    afterEach(() => {
      cy.logout();
    });

    it('should follow and unfollow users', () => {
      // Navigate to another user's profile
      cy.logout();
      cy.loginWithEmail('social2@example.com', 'password123!');
      cy.generateHaiku('follow test');
      cy.saveHaiku();
      cy.toggleHaikuVisibility();
      cy.logout();
      
      cy.loginWithEmail('social1@example.com', 'password123!');
      cy.contains('Explore').click();
      cy.contains('Social User 2').click();
      
      // Follow user
      cy.contains('Follow').click();
      cy.contains('Following').should('be.visible');
      
      // Check follower count updated
      cy.get('.followers-count').should('contain', '1');
      
      // Unfollow user
      cy.contains('Following').click();
      cy.contains('Follow').should('be.visible');
      cy.get('.followers-count').should('contain', '0');
    });

    it('should show following feed', () => {
      // User 2 creates haikus
      cy.logout();
      cy.loginWithEmail('social2@example.com', 'password123!');
      cy.generateHaiku('feed test 1');
      cy.saveHaiku();
      cy.toggleHaikuVisibility();
      cy.generateHaiku('feed test 2');
      cy.saveHaiku();
      cy.toggleHaikuVisibility();
      
      // User 1 follows User 2
      cy.logout();
      cy.loginWithEmail('social1@example.com', 'password123!');
      cy.contains('Explore').click();
      cy.contains('Social User 2').first().click();
      cy.contains('Follow').click();
      
      // Check following feed
      cy.contains('Following Feed').click();
      cy.contains('feed test 1').should('be.visible');
      cy.contains('feed test 2').should('be.visible');
      cy.contains('Social User 2').should('be.visible');
    });

    it('should list followers and following', () => {
      // Setup follow relationships
      cy.logout();
      cy.loginWithEmail('social2@example.com', 'password123!');
      cy.generateHaiku('visible haiku');
      cy.saveHaiku();
      cy.toggleHaikuVisibility();
      cy.logout();
      
      cy.loginWithEmail('social3@example.com', 'password123!');
      cy.contains('Explore').click();
      cy.contains('Social User 2').click();
      cy.contains('Follow').click();
      cy.logout();
      
      // Check followers list
      cy.loginWithEmail('social2@example.com', 'password123!');
      cy.get('#user-menu').click();
      cy.contains('Profile').click();
      cy.contains('1 Follower').click();
      
      // Should show followers modal
      cy.get('.followers-modal').should('be.visible');
      cy.contains('Social User 3').should('be.visible');
    });
  });

  describe('Collections', () => {
    beforeEach(() => {
      cy.loginWithEmail('social1@example.com', 'password123!');
    });

    afterEach(() => {
      cy.logout();
    });

    it('should create a new collection', () => {
      cy.get('#user-menu').click();
      cy.contains('Collections').click();
      
      // Create collection
      cy.contains('New Collection').click();
      cy.get('#collection-name').type('Nature Haikus');
      cy.get('#collection-description').type('My favorite haikus about nature');
      cy.contains('Create Collection').click();
      
      // Verify creation
      cy.contains('Collection created successfully').should('be.visible');
      cy.contains('Nature Haikus').should('be.visible');
    });

    it('should add haiku to collection', () => {
      // Create haiku
      cy.generateHaiku('collection test');
      cy.saveHaiku();
      
      // Add to collection
      cy.get('.haiku-card').within(() => {
        cy.get('.add-to-collection-btn').click();
      });
      
      // Select or create collection
      cy.get('.collection-selector').should('be.visible');
      cy.contains('Create New Collection').click();
      cy.get('#collection-name').type('Test Collection');
      cy.contains('Create & Add').click();
      
      // Verify addition
      cy.contains('Added to collection').should('be.visible');
    });

    it('should view collection contents', () => {
      // Assume collection exists with haikus
      cy.get('#user-menu').click();
      cy.contains('Collections').click();
      
      // Click on a collection
      cy.contains('Nature Haikus').click();
      
      // Should show collection details
      cy.contains('Nature Haikus').should('be.visible');
      cy.get('.collection-haikus .haiku-card').should('have.length.at.least', 1);
    });

    it('should make collection public/private', () => {
      cy.get('#user-menu').click();
      cy.contains('Collections').click();
      cy.contains('Nature Haikus').click();
      
      // Toggle visibility
      cy.contains('Edit Collection').click();
      cy.get('#collection-public').check();
      cy.contains('Save Changes').click();
      
      // Verify visibility change
      cy.contains('Collection updated').should('be.visible');
      cy.get('.visibility-badge').should('contain', 'Public');
    });

    it('should delete collection', () => {
      cy.get('#user-menu').click();
      cy.contains('Collections').click();
      cy.contains('Test Collection').click();
      
      // Delete collection
      cy.contains('Delete Collection').click();
      cy.contains('Confirm Delete').click();
      
      // Verify deletion
      cy.contains('Collection deleted').should('be.visible');
      cy.contains('Test Collection').should('not.exist');
    });
  });

  describe('Haiku Interactions', () => {
    beforeEach(() => {
      // Create test haikus
      cy.loginWithEmail('social1@example.com', 'password123!');
      cy.generateHaiku('interaction test');
      cy.saveHaiku();
      cy.toggleHaikuVisibility();
      cy.logout();
    });

    it('should like haikus from other users', () => {
      cy.loginWithEmail('social2@example.com', 'password123!');
      cy.contains('Explore').click();
      
      // Find and like haiku
      cy.contains('interaction test').parents('.haiku-card').within(() => {
        cy.get('.likes-count').invoke('text').then((initialLikes) => {
          cy.get('.like-btn').click();
          cy.get('.like-btn').should('have.class', 'liked');
          cy.get('.likes-count').should('contain', String(parseInt(initialLikes) + 1));
        });
      });
    });

    it('should track like statistics', () => {
      // Multiple users like the haiku
      cy.loginWithEmail('social2@example.com', 'password123!');
      cy.contains('Explore').click();
      cy.contains('interaction test').parents('.haiku-card').find('.like-btn').click();
      cy.logout();
      
      cy.loginWithEmail('social3@example.com', 'password123!');
      cy.contains('Explore').click();
      cy.contains('interaction test').parents('.haiku-card').find('.like-btn').click();
      cy.logout();
      
      // Check author's stats
      cy.loginWithEmail('social1@example.com', 'password123!');
      cy.get('#user-menu').click();
      cy.contains('Profile').click();
      
      // Should show updated like count
      cy.get('.total-likes').should('contain', '2');
    });

    it('should show haiku author info', () => {
      cy.loginWithEmail('social2@example.com', 'password123!');
      cy.contains('Explore').click();
      
      cy.contains('interaction test').parents('.haiku-card').within(() => {
        cy.contains('Social User 1').should('be.visible');
        cy.get('.author-avatar').should('be.visible');
        cy.get('.timestamp').should('be.visible');
      });
    });
  });

  describe('Explore and Discovery', () => {
    beforeEach(() => {
      // Create diverse haikus for testing
      const themes = ['nature', 'love', 'seasons', 'life'];
      cy.loginWithEmail('social1@example.com', 'password123!');
      
      themes.forEach(theme => {
        cy.generateHaiku(theme);
        cy.saveHaiku();
        cy.toggleHaikuVisibility();
      });
      
      cy.logout();
    });

    it('should browse public haikus', () => {
      cy.contains('Explore').click();
      
      // Should show public haikus
      cy.get('.haiku-card').should('have.length.at.least', 4);
      cy.contains('nature').should('be.visible');
      cy.contains('love').should('be.visible');
    });

    it('should filter haikus by theme', () => {
      cy.contains('Explore').click();
      
      // Click on theme tag
      cy.get('.theme-tag').contains('nature').click();
      
      // Should filter to nature theme
      cy.get('.haiku-card').each(($card) => {
        cy.wrap($card).find('.theme-tag').should('contain', 'nature');
      });
    });

    it('should search haikus', () => {
      cy.contains('Explore').click();
      
      // Use search
      cy.get('#search-haikus').type('love');
      cy.get('#search-btn').click();
      
      // Should show matching haikus
      cy.get('.haiku-card').should('have.length.at.least', 1);
      cy.get('.haiku-card').first().should('contain', 'love');
    });

    it('should show trending haikus', () => {
      // Like some haikus to make them trending
      cy.loginWithEmail('social2@example.com', 'password123!');
      cy.contains('Explore').click();
      
      // Like multiple haikus
      cy.get('.haiku-card').first().find('.like-btn').click();
      cy.get('.haiku-card').eq(1).find('.like-btn').click();
      
      // Check trending section
      cy.contains('Trending').click();
      cy.get('.haiku-card').should('have.length.at.least', 1);
      
      // Should be sorted by likes
      cy.get('.likes-count').then(($likes) => {
        const likes = [...$likes].map(el => parseInt(el.textContent));
        expect(likes).to.deep.equal([...likes].sort((a, b) => b - a));
      });
    });
  });
});