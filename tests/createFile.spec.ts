import { test } from "../fixtures";

test("Create a new file", async ({ workspacePage }) => {
  await workspacePage.createEmptyService("Test Service");
  await workspacePage.createNewFile("Test-file.ts");
  await workspacePage.codeEditorCheck();
});
