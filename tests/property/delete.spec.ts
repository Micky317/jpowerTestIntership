import { test } from "@playwright/test";
import { deleteForm, signIn } from "@/utils";
import { createProperty, propertyTimeout } from "@/utils/data/property";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(propertyTimeout);
  await signIn(page);
});

test("Verify Property can be deleted and no longer displayed in the table", async ({ page }) => {
  const name = "Property Delete 1";
  await createProperty(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
});
