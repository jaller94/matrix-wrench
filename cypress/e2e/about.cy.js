describe('About Page', () => {
    it('Allows to navigate to the About page by clicking on the About link', () => {
        cy.visit('http://localhost:1234');
        cy.contains('About').click();
        cy.contains('What is Matrix Wrench?');
    });
    it('Allows to navigate to the About page by URL', () => {
        cy.visit('http://localhost:1234#about');
        cy.contains('What is Matrix Wrench?');
    });
    it('Allows to navigate to the About page by clicking on the About link', () => {
        cy.visit('http://localhost:1234#about');
        cy.get('[title="Back"]').click();
        cy.contains('Identities');
    });
});
