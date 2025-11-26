import { test } from "../fixtures/fixtures";
import { testData } from "../utils/test-data";

test.skip("TC_003: Create service, add file, edit file, save file and use terminal", async ({
  workspacePage,
}) => {
  await workspacePage.createEmptyService(testData.serviceName);
  await workspacePage.createNewFile(testData.fileName, testData.serviceName);
  await workspacePage.writeOnEditor(testData.fileName);
  await workspacePage.closeFileAndSave(testData.fileName);
  await workspacePage.addTerminal(testData.serviceName);
  await workspacePage.testTerminal();
  await workspacePage.closeTerminal(testData.serviceName);
});
