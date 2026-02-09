describe('Home and About Page Tests', () => {
  it('should visit the home page', () => {
    cy.visit('http://localhost:5173');
    cy.contains('Home').should('be.visible');
  });

  it('should navigate to about page', () => {
    cy.visit('http://localhost:5173');
    cy.get('a[href="/about"]').click();
    cy.url().should('include', '/about');
    cy.contains('About').should('be.visible');
  });

  it('should navigate back to home from about page', () => {
    cy.visit('http://localhost:5173/about');
    cy.get('a[href="/"]').click();
    cy.url().should('eq', 'http://localhost:5173/');
    cy.contains('Home').should('be.visible');
  });
});
