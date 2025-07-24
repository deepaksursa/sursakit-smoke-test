import { test } from "../fixtures/fixtures";
import { TestData } from "../utils/test-data";

test("TC_003: Create service, add file, edit and use terminal", async ({
  workspacePage,
}) => {
  await workspacePage.createEmptyService(TestData.serviceName);
  await workspacePage.createNewFile(TestData.fileName, TestData.serviceName);
  await workspacePage.codeEditorCheck(TestData.fileName);
  await workspacePage.addTerminal(TestData.serviceName);
});
