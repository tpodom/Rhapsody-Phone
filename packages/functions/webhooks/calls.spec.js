const functions = require("firebase-functions-test");
const calls = require("./calls");

const testEnv = functions();

describe("webhooks - calls", () => {
  describe("incoming", () => {
    it("should return empty response", async () => {
      const req = { query: {}, body: {} };
      const res = {
        send: jest.fn(),
      };
      await calls.incoming(req, res);
      expect(res.send).toHaveBeenCalledWith({});
    });
  });
});
