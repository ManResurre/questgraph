import { should } from "chai";

describe("Authentication Process Tests", () => {
  it("should handle authentication flow correctly", () => {
    // Перехватываем сетевые запросы
    cy.intercept("POST", "**/save-public-key").as("savePublicKey");
    cy.intercept("POST", "**/get-challenge").as("get-challenge");
    cy.intercept("POST", "**/verify-signature").as("verifySignature");
    cy.intercept("GET", "**/user").as("getUser");

    cy.visit("http://localhost:5173");

    // Ждем загрузки компонента навигации
    cy.get("header").contains("Quest Editor").should("exist");

    // Проверяем, что кнопки отображаются
    cy.get("button").should("have.length.greaterThan", 0);

    // Ждем автоматический запрос регистрации
    cy.wait("@savePublicKey").its("response.statusCode").should("eq", 200);

    // Кликаем по кнопке входа (предполагаем, что первая кнопка с иконкой - это кнопка входа)
    cy.get(".loader").should("not.exist");
    cy.get("header button").last().click();

    cy.wait("@get-challenge").its("response.statusCode").should("eq", 200);

    cy.wait("@verifySignature").its("response.statusCode").should("eq", 500);

    cy.wait("@verifySignature").its("response.statusCode").should("eq", 200);

    cy.wait("@getUser").its("response.statusCode").should("eq", 200);

    cy.get("a").contains("Quests").should("exist");
  });
});
