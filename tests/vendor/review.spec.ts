import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { getId, getMyName, saveForm, signIn } from "@/utils";
import { fillContactCard, validateContactCard } from "@/utils/contact";
import { addRoleToUser } from "@/utils/data/user";
import { createVendor, openVendorsTable, vendorTimeout } from "@/utils/data/vendor";
import { selectOption } from "@/utils/input";
import {
  editTableColumns,
  getCellSelector,
  getColumnCount,
  getRowCount,
  openCreatePage,
  openFirstRow,
  resetTable,
  scrollTableRight,
  searchTable,
  testColumnReposition,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(vendorTimeout);
  await signIn(page);
  await openVendorsTable(page);
  await resetTable(page);
});

test("Verify that all the information entered when creating the vendor is displayed in the table: Id, Name, Account Manager (if linked), Created At", async ({
  page,
}) => {
  await addRoleToUser(page, "Zone Manager");

  await openCreatePage(page);
  const id = getId();
  await page.fill("#name", id);
  const zoneManager = await selectOption(page, "#zoneManagerId");
  await saveForm(page);

  await resetTable(page);
  await searchTable(page, id);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText(id);
  await expect(page.locator(getCellSelector(2, 2))).toHaveText(String(zoneManager));

  const columnCount = await getColumnCount(page);
  await scrollTableRight(page);
  const createdAt = await page.locator(getCellSelector(2, columnCount - 2)).textContent();
  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, hmm A");
  await expect([now, lastMinute]).toContain(createdAt);
});

test("Verify that the number of rows displayed in the top corner of the table corresponds to the total number of records", async ({
  page,
}) => {
  const name = "Vendor Review 2";
  await createVendor(page, { name });
  await searchTable(page, name);
  await expect(await getRowCount(page)).toBe(1);
});

test("If no external id was added in the creation, verify Linked is red, otherwise, verify the Linked is green", async ({
  page,
}) => {
  const name = "Vendor Review 3";
  await createVendor(page, { name });
  await searchTable(page, name);
  await expect(page.locator(`${getCellSelector(2, 1)} [data-value="true"]`)).toBeVisible();
});

test("Verify that all the information entered when creating the vendor is displayed in the form when selecting the vendor created", async ({
  page,
}) => {
  await addRoleToUser(page, "Zone Manager");
  await openCreatePage(page);
  const id = getId();
  const notes = "notes";

  await page.fill("#name", id);
  const zoneManager = await selectOption(page, "#zoneManagerId");
  await page.fill("#notes", notes);
  await page.click("#addContact");
  const contact = await fillContactCard(page, "#contacts-0");
  await fillContactCard(page, "#billingContact");

  await saveForm(page);
  await searchTable(page, id);
  await openFirstRow(page);

  await expect(page.locator("#name")).toHaveValue(id);
  await expect(page.locator("#zoneManagerId")).toHaveValue(String(zoneManager));
  await expect(page.locator("#notes")).toHaveValue(notes);
  await validateContactCard(page, "#contacts-0", contact);
  await validateContactCard(page, "#billingContact", contact);
});

test("Verify that the vendor's name is displayed at the top left of the Profile section: 'Vendors / [vendorName]'", async ({
  page,
}) => {
  const name = "Vendor Review 5";
  await createVendor(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);
  await expect(page.locator("#breadcrumb-1")).toHaveText(name);
});

test("Verify Profit section is displayed in the form when selecting the vendor created: Projected Profit Margin, Actual Profit Margin fields", async ({
  page,
}) => {
  await openFirstRow(page);
  await expect(page.getByText("Projected Profit Margin")).toBeVisible();
  await expect(page.getByText("Actual Profit Margin")).toBeVisible();
});

test("Verify that the '+' icon in the table allows you to add more columns to the table or remove them", async ({
  page,
}) => {
  await editTableColumns(page, ["Created By"], ["Name"]);
  const columnCount = await getColumnCount(page);
  await expect(page.locator(getCellSelector(0, 0))).toHaveText("Linked");
  await expect(page.locator(getCellSelector(0, columnCount - 1))).toHaveText("Created By");
  await resetTable(page);
});

test("Verify that the 'Created By', 'Update Time', 'Updated By' the columns are filled accordingly with name and time according to the vendor creation", async ({
  page,
}) => {
  const name = "Vendor Review 8";
  const myName = await getMyName(page);
  await createVendor(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);
  await page.waitForSelector("#name");
  await saveForm(page);

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
