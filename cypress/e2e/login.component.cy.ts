describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/auth/signin');
    cy.url().should('include', '/auth/signin'); 
    cy.get('.auth-content').should('be.visible');
  });
  

  it('should display the login form', () => {
    cy.get('.auth-wrapper').should('be.visible');
    cy.get('.auth-content').should('be.visible');
    cy.get('.card').should('be.visible');
    cy.get('.input-group').should('be.visible');
    cy.get('button.btn-primary').should('be.visible');
  });

  it('should allow the user to enter a username and password', () => {
    cy.get('input[type="email"]').type('testuser@example.com');
    cy.get('input#signin-password').type('password123');

    cy.get('input[type="email"]').should('have.value', 'testuser@example.com');
    cy.get('input#signin-password').should('have.value', 'password123');
  });

  it('should toggle password visibility', () => {
    cy.get('i.feather.icon-eye-off').click();
    
    cy.get('input#signin-password').should('have.attr', 'type', 'text');

    cy.get('i.feather.icon-eye').click();
    
    cy.get('input#signin-password').should('have.attr', 'type', 'password');
  });

  it('should submit the form when the login button is clicked', () => {
    cy.intercept('POST', '/api/auth/**').as('loginRequest');
    cy.get('input[type="email"]').type('bouazizdorra7@gmail.com');
    cy.get('input#signin-password').type('Hello@2024');
    cy.get('button.btn-primary').click();

    cy.url().should('include', '/dashboard');
  });

  it('should display "Invalid credentials" message when login fails', () => {
    cy.intercept('GET', '/api/auth/username*').as('usernameCheck');
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
    
    cy.get('input[type="email"]').type('wronguser@example.com');
    cy.get('input#signin-password').type('wrongpassword');
    
    cy.get('button.btn-primary').click();
    
    cy.wait('@usernameCheck').its('response.statusCode').should('eq', 404);
    
    cy.contains('Invalid credentials', { timeout: 10000 }).should('be.visible');

  });
  
  
  it('should navigate to forgot password page when clicked', () => {
    cy.get('a[href="/auth/forgot-password"]').click(); 
    cy.url().should('include', '/auth/forgot-password');
  });

  it('should navigate to sign up page when clicked', () => {
    cy.get('a[href="/auth/signup"]').click();
    cy.url().should('include', '/auth/signup');
  });
});