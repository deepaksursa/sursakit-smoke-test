import { test } from "../fixtures/fixtures";
import { TestData } from "../utils/test-data";

test.skip("TC_003: Create service, add file, edit file, save file and use terminal", async ({
  workspacePage,
}) => {
  await workspacePage.createEmptyService(TestData.serviceName);
  await workspacePage.createNewFile(TestData.fileName, TestData.serviceName);
  await workspacePage.writeOnEditor(TestData.fileName);
  await workspacePage.closeFileAndSave(TestData.fileName);
  await workspacePage.addTerminal(TestData.serviceName);
  await workspacePage.testTerminal();
  await workspacePage.closeTerminal(TestData.serviceName);
});
