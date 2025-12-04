import { test } from "@playwright/test";
import { signIn } from "@/utils";
import { openVendorsTable, vendorTimeout } from "@/utils/data/vendor";
import { openCreatePage, testImport } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(vendorTimeout);
  await signIn(page);
  await openVendorsTable(page);
});

test("verify that when clicking on 'New Vendor' the form is displayed correctly", async ({
  page,
}) => {
  await openCreatePage(page);
});

test("verify that when clicking on 'Export' the table is exported correctly", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.click("#export");
  await downloadPromise;
});

test("verify that when clicking on the down arrow to display the import option displays the Export and Import options", async ({
  page,
}) => {
  await page.click("#export-menu-toggle");
  await page.waitForSelector("#export-menu #exportTemplate");
  await page.waitForSelector("#export-menu #importTemplate");
});

test("verify that when clicking on 'Import' a csv file can be imported", async ({ page }) => {
  await testImport(page, "Vendors.csv");
});
