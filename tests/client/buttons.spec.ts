import { test } from "@playwright/test";
import { signIn } from "@/utils";
import { clientTimeout, openClientsTable } from "@/utils/data/client";
import { openCreatePage, testImport } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(clientTimeout);
  await signIn(page);
  await openClientsTable(page);
});

test("verify that when clicking on 'New Client' the form is displayed correctly", async ({
  page,
}) => {
  await openCreatePage(page);
});

test("verify that when clicking on 'Export' the table is exported correctly", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.click("#export");
  await downloadPromise;
});
//update for this secction
test("verify that when clicking on the down arrow to display the import option displays the Export and Import options", async ({
  page,
}) => {
  await page.click("#export-menu-toggle");
  await page.waitForSelector("#import", { state: "visible", timeout: 5000 });
});
//update for this secction
test("verify that when clicking on 'Import' a csv file can be imported", async ({ page }) => {
  await testImport(page, "Clients.csv");
});
