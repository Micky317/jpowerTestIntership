import { test } from "@playwright/test";
import { deleteForm, signIn } from "@/utils";
import { createRequest, requestTimeout } from "@/utils/data/request";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(requestTimeout);
  await signIn(page);
});

test("Verify that a request can be deleted", async ({ page }) => {
  const name = "Request Delete 1";
  await createRequest(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
});
