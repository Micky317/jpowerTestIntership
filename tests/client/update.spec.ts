import { expect, test } from "@playwright/test";
import { deleteForm, saveForm, signIn, validateUpdateTime } from "@/utils";
import {
  clientTimeout,
  createClient,
  deleteClient,
  openClientsTable,
  updateClient,
} from "@/utils/data/client";
import { validateContact } from "@/utils/data/user";
import { testDownload } from "@/utils/input";
import {
  editTableColumns,
  getCellSelector,
  getColumnCount,
  openFirstRow,
  scrollTableRight,
  searchTable,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(clientTimeout);
  await signIn(page);
  await openClientsTable(page);
});

test("Verify that all fields can be modified within the form", async ({ page }) => {
  const name = "Client Update 1";
  await createClient(page, { name });
  await updateClient(page, { name });
  await deleteClient(page, "Edited " + name);
});

test("Verify that all fields that have been modified are shown in the table record changes", async ({
  page,
}) => {
  const name = "Client Update 2";
  await createClient(page, { name });
  await updateClient(page, { name });
  await searchTable(page, name);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText("Edited " + name);
  await deleteClient(page, "Edited " + name);
});

test("Verify that all fields that have been modified are displayed in the form record changes", async ({
  page,
}) => {
  const name = "Client Update 3";
  await createClient(page, { name });
  await updateClient(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);

  await expect(page.locator("#name")).toHaveValue("Edited " + name);
  await expect(page.locator("#shortId")).toHaveValue("Edited " + name);
  await expect(page.locator("#priority")).toHaveValue("Medium");
  await deleteForm(page);
});

test("Verify that 'Update Time', 'Updated By' columns are updated", async ({ page }) => {
  const name = "Client Update 4";
  await createClient(page, { name });
  await editTableColumns(page, ["Created By", "Update Time", "Updated By"]);
  await searchTable(page, name);

  await scrollTableRight(page);
  const columnCount = await getColumnCount(page);
  const updateTime = (await page.locator(getCellSelector(2, columnCount - 2)).textContent()) || "";

  await openFirstRow(page);
  await saveForm(page);
  await searchTable(page, name);
  await validateUpdateTime(updateTime);
  await deleteClient(page, name);
});

test("Verify that the item can be displayed in another tab when the download button is clicked", async ({
  page,
}) => {
  const name = "Client Update 5";
  await createClient(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await testDownload(page, name);
  await deleteClient(page, name);
});

test("Verify that the item can be deleted when the delete button is clicked", async ({ page }) => {
  const name = "Client Update 6";
  await createClient(page, { name });
  await updateClient(page, { name });
  await deleteClient(page, "Edited " + name);
});

test("Verify Billing Contact section fields can be modified", async ({ page }) => {
  const name = "Client Update 7";
  await createClient(page, { name });
  await updateClient(page, { name });
  await searchTable(page, "Edited " + name);
  await openFirstRow(page);

  await validateContact(page, "billingContact");
  await deleteForm(page);
});

test("Verify Contact section field can be modified", async ({ page }) => {
  const name = "Client Update 8";
  await createClient(page, { name });
  await updateClient(page, { name });
  await searchTable(page, "Edited " + name);

  await openFirstRow(page);
  await validateContact(page, "contacts-0");
  await deleteForm(page);
});
