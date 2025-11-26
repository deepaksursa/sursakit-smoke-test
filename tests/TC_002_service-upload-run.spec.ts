import { test } from "../fixtures/fixtures";
import { testData } from "../utils/test-data";

test.skip("TC_002: Create service, upload project, and run", async ({
  workspacePage,
}) => {
  await workspacePage.createEmptyService(testData.serviceName);
  await workspacePage.uploadFile(testData.serviceName);
});
