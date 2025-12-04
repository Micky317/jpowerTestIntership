import { test } from "@playwright/test";
import { signIn } from "@/utils";
import { openUsersTable } from "@/utils/data/user";
import { openCreatePage, testImport } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  await signIn(page);
  await openUsersTable(page);
});

test("Verify that when clicking on 'New User' the form is displayed correctly", async ({
  page,
}) => {
  await openCreatePage(page);
});

test("Verify that when clicking on 'Export' the table is exported correctly", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.click("#export");
  await downloadPromise;
});

test("Verify that when clicking on the down arrow to display the import option displays the Export and Import options", async ({
  page,
}) => {
  await page.click("#export-menu-toggle");
  await page.waitForSelector("#export-menu #export");
  await page.waitForSelector("#export-menu #exportTemplate");
  await page.waitForSelector("#export-menu #importTemplate");
});

test("Verify that when clicking on 'Import' a csv file can be imported", async ({ page }) => {
  await testImport(page, "Users.csv");
});
