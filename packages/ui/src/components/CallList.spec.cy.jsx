import { Application } from "../../cypress/templates";
import CallList from "./CallList.vue";

describe("CallList", () => {
  it("should render call list", () => {
    cy.mount(() => (
      <Application>
        <CallList />
      </Application>
    ));
    cy.get(".call-list").should("exist");
  });
});
