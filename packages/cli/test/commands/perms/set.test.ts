import { expect, test } from "@oclif/test";

describe("set permissions", () => {
  test
    .stdout()
    .command(["perms", "set"])
    .it("reports error about missing args", (ctx) => {
      expect(ctx.stdout).to.contain("hello friend from oclif!");
    });
});
