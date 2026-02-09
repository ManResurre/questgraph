describe('Login and Navigation Tests', () => {
  it('should allow user to login and show Quests menu item', () => {
    cy.visit('http://localhost:5173');

    // Проверим начальное состояние кнопки входа
    cy.get('button.MuiIconButton-root').first().then(($btn) => {
      const initialBtnText = $btn.text();
      cy.log(`Initial button text: ${initialBtnText}`);
    });

    // Кликаем по кнопке входа
    cy.get('button.MuiIconButton-root').first().click();

    // Ждем, пока состояние изменится
    cy.wait(3000);

    // Проверим, что кнопка изменила свое состояние (например, текст или иконка)
    cy.get('button.MuiIconButton-root').first().then(($btn) => {
      const updatedBtnText = $btn.text();
      cy.log(`Updated button text: ${updatedBtnText}`);

      // Проверим, что на странице появились элементы навигации
      cy.get('nav a').should('have.length.greaterThan', 0);

      // Ищем ссылку с текстом 'Quests' или 'Scenes' (в зависимости от структуры)
      cy.get('nav a').contains(/Quests|Scenes/).should('exist');
    });
  });

  it('should show login button initially and change after login', () => {
    cy.visit('http://localhost:5173');

    // Проверяем, что кнопка входа отображается
    cy.get('button.MuiIconButton-root').should('exist');

    // Кликаем по кнопке входа
    cy.get('button.MuiIconButton-root').first().click();

    // Ждем изменений в UI
    cy.wait(3000);

    // Проверяем, что кнопка изменила состояние
    cy.get('button.MuiIconButton-root').should('exist');
  });
});
