const webhooks = require("./webhooks");

describe("webhooks", () => {
  describe("incoming call", () => {
    it("should return empty response", async () => {
      const req = { query: {}, body: {} };
      const res = {
        send: jest.fn(),
      };
      await webhooks.incoming(req, res);
      expect(res.send).toHaveBeenCalledWith({});
    });
  });
});
