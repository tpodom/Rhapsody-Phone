import { test } from "@oclif/test";

describe("set permissions", () => {
  test.stderr().command(["perms:set"]).exit(2).it("exits with status 2 when missing required args");
});
