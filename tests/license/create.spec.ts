import test, { expect } from "@playwright/test";
import { signIn } from "@/utils";
import { createLicense, licenseTimeout, openLicensesTable } from "@/utils/data/license";
import { openCreatePage } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(licenseTimeout);
  await signIn(page);
});

test("Verify that a license cannot be created if all required fields are not completed: type and User", async ({
  page,
}) => {
  await openLicensesTable(page);
  await openCreatePage(page);
  await page.click("#save");
  await expect(page.locator("#error")).toBeVisible();
});

test("Verify that the license fields can be filled", async ({ page }) => {
  const name = "License Create 2";
  await createLicense(page, { name });
});

test("Verify that the license can be created", async ({ page }) => {
  const name = "License Create 3";
  await createLicense(page, { name, createNew: true });
});
