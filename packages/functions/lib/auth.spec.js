jest.mock("firebase-admin");
jest.mock("./init", () => {
  return {
    logger: console.log,
  };
});

const auth = require("./auth");

describe("auth", () => {
  describe("isAdmin", () => {
    it("should return false if admin is not present", () => {
      expect(auth.isAdmin({})).toBeFalsy();
    });
  });
});
