describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForFirebase();
  });

  afterEach(() => {
    cy.logout();
  });

  describe('User Registration', () => {
    it('should successfully register a new user', () => {
      // Click register link
      cy.contains('Create an account').click();
      
      // Fill registration form
      cy.get('#register-email').type('testuser@example.com');
      cy.get('#register-password').type('testPassword123!');
      cy.get('#register-displayname').type('Test User');
      
      // Submit form
      cy.get('form').contains('Register').click();
      
      // Verify registration success
      cy.contains('Welcome, Test User').should('be.visible');
      cy.get('#user-menu').should('be.visible');
    });

    it('should show error for duplicate email', () => {
      // First create a user
      cy.createTestUser('existing@example.com', 'password123!', 'Existing User');
      cy.logout();
      
      // Try to register with same email
      cy.contains('Create an account').click();
      cy.get('#register-email').type('existing@example.com');
      cy.get('#register-password').type('differentPassword123!');
      cy.get('#register-displayname').type('Another User');
      
      cy.get('form').contains('Register').click();
      
      // Verify error message
      cy.contains('email-already-in-use').should('be.visible');
    });

    it('should validate password requirements', () => {
      cy.contains('Create an account').click();
      
      // Try weak password
      cy.get('#register-email').type('newuser@example.com');
      cy.get('#register-password').type('weak');
      cy.get('#register-displayname').type('New User');
      
      cy.get('form').contains('Register').click();
      
      // Verify error message
      cy.contains('Password should be at least 6 characters').should('be.visible');
    });

    it('should require display name', () => {
      cy.contains('Create an account').click();
      
      cy.get('#register-email').type('newuser@example.com');
      cy.get('#register-password').type('password123!');
      // Don't fill display name
      
      cy.get('form').contains('Register').click();
      
      // Verify validation message
      cy.get('#register-displayname:invalid').should('exist');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create test user for login tests
      cy.createTestUser('logintest@example.com', 'testPassword123!', 'Login Test User');
      cy.logout();
    });

    it('should successfully login with valid credentials', () => {
      // Click login link
      cy.contains('Login').first().click();
      
      // Fill login form
      cy.get('#login-email').type('logintest@example.com');
      cy.get('#login-password').type('testPassword123!');
      
      // Submit form
      cy.get('form').contains('Login').click();
      
      // Verify login success
      cy.contains('Welcome back, Login Test User').should('be.visible');
      cy.get('#user-menu').should('be.visible');
    });

    it('should show error for invalid credentials', () => {
      cy.contains('Login').first().click();
      
      cy.get('#login-email').type('logintest@example.com');
      cy.get('#login-password').type('wrongPassword!');
      
      cy.get('form').contains('Login').click();
      
      // Verify error message
      cy.contains('Invalid email or password').should('be.visible');
    });

    it('should show error for non-existent user', () => {
      cy.contains('Login').first().click();
      
      cy.get('#login-email').type('nonexistent@example.com');
      cy.get('#login-password').type('anyPassword123!');
      
      cy.get('form').contains('Login').click();
      
      // Verify error message
      cy.contains('user-not-found').should('be.visible');
    });

    it('should handle empty fields', () => {
      cy.contains('Login').first().click();
      
      // Try to submit without filling fields
      cy.get('form').contains('Login').click();
      
      // Verify validation
      cy.get('#login-email:invalid').should('exist');
      cy.get('#login-password:invalid').should('exist');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.createTestUser('logouttest@example.com', 'testPassword123!', 'Logout Test User');
    });

    it('should successfully logout user', () => {
      // Verify logged in
      cy.contains('Welcome back, Logout Test User').should('be.visible');
      
      // Click logout
      cy.get('#user-menu').click();
      cy.contains('Logout').click();
      
      // Verify logged out
      cy.contains('Login').should('be.visible');
      cy.contains('Create an account').should('be.visible');
      cy.get('#user-menu').should('not.exist');
    });
  });

  describe('Authentication Persistence', () => {
    it('should remember logged in user on page refresh', () => {
      cy.createTestUser('persist@example.com', 'testPassword123!', 'Persist User');
      
      // Verify logged in
      cy.contains('Welcome back, Persist User').should('be.visible');
      
      // Refresh page
      cy.reload();
      cy.waitForFirebase();
      
      // Should still be logged in
      cy.contains('Welcome back, Persist User').should('be.visible');
      cy.get('#user-menu').should('be.visible');
    });
  });

  describe('Protected Features', () => {
    it('should require login to save haikus', () => {
      // Generate a haiku without login
      cy.generateHaiku('nature');
      
      // Try to save
      cy.get('#save-btn').click();
      
      // Should prompt to login
      cy.contains('Please login to save haikus').should('be.visible');
      cy.get('#auth-modal').should('be.visible');
    });

    it('should require login to access gallery', () => {
      // Try to access gallery without login
      cy.contains('Gallery').click();
      
      // Should redirect to login
      cy.contains('Please login to view your gallery').should('be.visible');
      cy.get('#auth-modal').should('be.visible');
    });
  });
});