const schema = require("./schema");

describe("GraphQL schema", () => {
  it("should compile schema", () => {
    console.log(schema);
    expect(schema).toMatchObject({
      kind: "Document",
    });
  });
});
