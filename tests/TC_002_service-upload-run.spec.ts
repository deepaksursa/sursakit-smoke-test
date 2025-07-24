import { test } from "../fixtures/fixtures";
import { TestData } from "../utils/test-data";

test("TC_002: Create service, upload project, and run", async ({
  workspacePage,
}) => {
  await workspacePage.createEmptyService(TestData.serviceName);
  await workspacePage.uploadFile(TestData.serviceName);
});
