// tests/service-upload.spec.ts
import { test } from "../fixtures";

test("Upload a file in service", async ({ workspacePage }) => {
  await workspacePage.createEmptyService("Test Service");
  await workspacePage.uploadFile();
});
