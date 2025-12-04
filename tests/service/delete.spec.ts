import { test } from "@playwright/test";
import { deleteForm, signIn } from "@/utils";
import { createService, openServicesTable, serviceTimeout } from "@/utils/data/service";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(serviceTimeout);
  await signIn(page);
  await openServicesTable(page);
});

test("Verify Service can be deleted and no longer displayed in the table", async ({ page }) => {
  const name = "Delete 1";
  await createService(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
});
