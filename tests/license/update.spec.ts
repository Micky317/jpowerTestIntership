import test, { expect } from "@playwright/test";
import dayjs from "dayjs";
import { saveForm, signIn } from "@/utils";
import { createLicense, licenseTimeout, openLicensesTable } from "@/utils/data/license";
import { createUser } from "@/utils/data/user";
import { selectOption } from "@/utils/input";
import {
  editTableColumns,
  getCellSelector,
  openCreatePage,
  openFirstRow,
  resetTable,
  searchTable,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(licenseTimeout);
  await signIn(page);
});

test("Verify that all fields can be modified within the form license", async ({ page }) => {
  await openLicensesTable(page);
  await openCreatePage(page);
  await page.click("#save");
  await expect(page.locator("#error")).toBeVisible();
});

test("Verify that the license fields can be filled", async ({ page }) => {
  const name = "License Update 2";
  await createUser(page, { name });

  await openLicensesTable(page);
  await openCreatePage(page);
  await selectOption(page, "#type", "Basic");
  await selectOption(page, "#user", `${name} ${name}`);
});

test("Verify that all fields that have been modified are shown in the table record changes request", async ({
  page,
}) => {
  const name = "License Update 3";
  await createUser(page, { name });

  await openLicensesTable(page);
  await searchTable(page, name);
  await openFirstRow(page);

  await selectOption(page, "#user", `${name} ${name}`);
  await saveForm(page);

  await searchTable(page, `${name} ${name}`);
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(`${name} ${name}`);
});

test("Verify that all fields that have been modified are displayed in the form record changes request", async ({
  page,
}) => {
  const name = "License Update 4";
  await createUser(page, { name });

  await openLicensesTable(page);
  await searchTable(page, name);
  await openFirstRow(page);
  await selectOption(page, "#user", `${name} ${name}`);
  await saveForm(page);

  await searchTable(page, `${name} ${name}`);
  await openFirstRow(page);
  await expect(page.locator("#type")).toHaveValue("Standard");
  await expect(page.locator("#user")).toHaveValue(`${name} ${name}`);
});

test("Verify that 'Update Time', 'Updated By' columns are updated request", async ({ page }) => {
  const name = "License Update 5";
  await createLicense(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await saveForm(page);

  await editTableColumns(
    page,
    ["Created By", "User", "Update Time", "Updated By", "Type"],
    ["Created At", "Id"],
  );
  await searchTable(page, name);

  const updateTime = await page.textContent(getCellSelector(2, 3));
  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(updateTime);

  await resetTable(page);
});
