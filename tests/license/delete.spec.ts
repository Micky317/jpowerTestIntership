import { test } from "@playwright/test";
import { deleteForm, signIn } from "@/utils";
import { createLicense, licenseTimeout } from "@/utils/data/license";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(licenseTimeout);
  await signIn(page);
});

test("Verify that a license can be deleted", async ({ page }) => {
  const name = "License Delete 1";
  await createLicense(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
});
