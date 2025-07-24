import { test } from "../fixtures/fixtures";
import { TestData } from "../utils/test-data";

test("TC_004: Create service, import GitHub Repo", async ({
  workspacePage,
}) => {
  await workspacePage.importFromGithub();
});
