import { test } from "@playwright/test";
import { deleteForm, signIn } from "@/utils";
import { createZone, openZonesTable } from "@/utils/data/zone";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  await signIn(page);
  await openZonesTable(page);
});

test("Verify Zone can be deleted and no longer displayed in the table", async ({ page }) => {
  const number = await createZone(page);

  await searchTable(page, number.toString());
  await openFirstRow(page);
  await deleteForm(page);
});
