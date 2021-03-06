/* eslint-disable */
describe('Test Admin Login', () => {
  before(() => {
    cy.visit('/').wait(3000);

    cy.get('body').then($body => {
      if ($body.text().includes('Test Admin') || $body.text().includes(Cypress.env('VUE_APP_TESTUSER_USER'))) {
        cy.signOut();
      }
    });
  });

  it('Visits the app root url', () => {
    cy.url().should('include', '/login');
  });

  it('Logs in as test admin', () => {
    cy.signInAdminUser();
  });
});
