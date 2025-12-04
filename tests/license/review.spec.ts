import test, { expect } from "@playwright/test";
import { saveForm, signIn } from "@/utils";
import { licenseTimeout, openLicensesTable } from "@/utils/data/license";
import { createUser, openUsersTable } from "@/utils/data/user";
import { selectOption } from "@/utils/input";
import { getCellSelector, openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(licenseTimeout);
  await signIn(page);
});

test("Verify that User has new license", async ({ page }) => {
  const name = "License Review 1";
  await createUser(page, { name });

  await openFirstRow(page);
  await expect(page.locator("#license")).toHaveValue("Standard");
});

test("Verify that User has update to new license", async ({ page }) => {
  const name = "License Review 2";
  await createUser(page, { name });

  await openFirstRow(page);
  await page.waitForTimeout(1000);
  await selectOption(page, "#license", "Premium");
  await saveForm(page);

  await openUsersTable(page);
  await searchTable(page, name);
  await expect(await page.locator(getCellSelector(2, 5)).textContent()).toBe("Premium");
});

test("Verify that License created on user is listed on license list", async ({ page }) => {
  const name = "License Review 3";
  await createUser(page, { name });

  await openFirstRow(page);
  await selectOption(page, "#license", "Standard");
  await saveForm(page);

  await openLicensesTable(page);
  await searchTable(page, name);
  await openFirstRow(page);
  await expect(page.locator("#user")).toHaveValue(`${name} ${name}`);
  await expect(page.locator("#type")).toHaveValue(`Standard`);
});
