import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { getId, getMyName, signIn } from "@/utils";
import { validateContactCard } from "@/utils/contact";
import { clientTimeout, createClient, openClientsTable } from "@/utils/data/client";
import { addRoleToUser } from "@/utils/data/user";
import {
  editTableColumns,
  getCellSelector,
  getColumnCount,
  getRowCount,
  openFirstRow,
  resetTable,
  scrollTableRight,
  searchTable,
  testColumnReposition,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(clientTimeout);
  await signIn(page);
  await openClientsTable(page);
});

test("Verify that all the information entered when creating the client is displayed in the table: Id, Name, Account Manager (if linked), Created At", async ({
  page,
}) => {
  const name = "Client Review 1" + getId();
  const accountManager = await addRoleToUser(page, "Account Manager");
  await createClient(page, { name, accountManager });

  await searchTable(page, name);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText(name);
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(name);
  await expect(page.locator(getCellSelector(2, 3))).toHaveText(accountManager);

  const columnCount = await getColumnCount(page);
  await scrollTableRight(page);
  const createdAt = await page.locator(getCellSelector(2, columnCount - 1)).textContent();
  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(createdAt);
});

test("Verify that the number of rows displayed in the top corner of the table corresponds to the total number of records", async ({
  page,
}) => {
  const name = "Client Review 2";
  await createClient(page, { name });

  await searchTable(page, name);
  await expect(await getRowCount(page)).toBe(1);
});

test("Verify that all the information entered when creating the client is displayed in the form when selecting the client created", async ({
  page,
}) => {
  const name = "Client Review 3";
  const accountManager = await addRoleToUser(page, "Account Manager");

  const {
    shortId: id,
    contact,
    billingContact,
    notes,
    priority,
  } = await createClient(page, { name, accountManager });

  await searchTable(page, name);
  await openFirstRow(page);

  await expect(page.locator("#name")).toHaveValue(name);
  await expect(page.locator("#shortId")).toHaveValue(id);
  await expect(page.locator("#accountManagerId")).toHaveValue(String(accountManager));
  await expect(page.locator("#notes")).toHaveValue(notes);
  await expect(page.locator("#priority")).toHaveValue(priority);
  await validateContactCard(page, "#contacts-0", contact);
  await validateContactCard(page, "#billingContact", billingContact);
});

test("Verify Profit section is displayed in the form when selecting the client created: Projected Profit Margin, Actual Profit Margin fields", async ({
  page,
}) => {
  const name = "Client Review 4";
  await createClient(page, { name });
  await openFirstRow(page);
  await expect(page.getByText("Projected Profit Margin")).toBeVisible();
  await expect(page.getByText("Actual Profit Margin")).toBeVisible();
});

test("Verify that the '+' icon in the table allows you to add more columns to the table or remove them", async ({
  page,
}) => {
  const columnCount = await getColumnCount(page);
  await editTableColumns(page, ["Created By"], ["Name"]);
  await expect(page.locator(getCellSelector(0, 0))).toHaveText("Id");
  await scrollTableRight(page);
  await expect(page.locator(getCellSelector(0, columnCount - 1))).toHaveText("Created By");
  await resetTable(page);
});

test("Verify that the 'Created By', 'Update Time', 'Updated By' the columns are filled accordingly with name and time according to the client creation", async ({
  page,
}) => {
  const name = getId();
  const myName = await getMyName(page);
  await createClient(page, { name });
  await editTableColumns(page, ["Created By", "Update Time", "Updated By"]);
  await scrollTableRight(page);
  await searchTable(page, name);

  const columnCount = await getColumnCount(page);
  const createdBy = await page.locator(getCellSelector(2, columnCount - 3)).textContent();
  const updateTime = await page.locator(getCellSelector(2, columnCount - 2)).textContent();
  const updatedBy = await page.locator(getCellSelector(2, columnCount - 1)).textContent();

  await expect(createdBy).toBe(myName);
  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(updateTime);
  await expect(updatedBy).toBe(myName);
  await resetTable(page);
});

test("Verify that the columns can be repositioned", async ({ page }) => {
  await testColumnReposition(page);
});
