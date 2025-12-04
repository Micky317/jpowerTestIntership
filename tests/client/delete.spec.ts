import { expect, test } from "@playwright/test";
import { deleteForm, getId, signIn } from "@/utils";
import { clientTimeout, createClient, openClientsTable } from "@/utils/data/client";
import { getCellSelector, getRowCount, openCreatePage, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(clientTimeout);
  await signIn(page);
  await openClientsTable(page);
});

test("Verify Client can be deleted and no longer displayed in the table", async ({ page }) => {
  await openCreatePage(page);
  const id = getId();
  await createClient(page, { name: id });

  await searchTable(page, id);
  await page.click(getCellSelector(2, 0));
  await deleteForm(page);

  await searchTable(page, id);
  await expect(await getRowCount(page)).toBe(0);
});
