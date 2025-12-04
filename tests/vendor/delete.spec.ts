import { test } from "@playwright/test";
import { deleteForm, signIn } from "@/utils";
import { createVendor, openVendorsTable, vendorTimeout } from "@/utils/data/vendor";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(vendorTimeout);
  await signIn(page);
  await openVendorsTable(page);
});

test("Verify Vendor can be deleted and no longer displayed in the table", async ({ page }) => {
  const name = "Vendor Delete 1";
  await createVendor(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
});
