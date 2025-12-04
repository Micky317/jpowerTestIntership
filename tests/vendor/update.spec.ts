import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { deleteForm, getId, getMyName, saveForm, signIn, uploadFile } from "@/utils";
import { fillContactCard, validateContactCard } from "@/utils/contact";
import { addRoleToUser } from "@/utils/data/user";
import { createVendor, openVendorsTable, vendorTimeout } from "@/utils/data/vendor";
import {
  editTableColumns,
  getCellSelector,
  getColumnCount,
  openCreatePage,
  openFirstRow,
  resetTable,
  scrollTableRight,
  searchTable,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(vendorTimeout);
  await signIn(page);
  await openVendorsTable(page);
});

test("Verify that all fields can be modified within the form", async ({ page }) => {
  const name = "Vendor Update 1" + getId();
  const zoneManager = await getMyName(page);
  await addRoleToUser(page, "Zone Manager");
  const { notes, contact, billingContact } = await createVendor(page, { name, zoneManager });
  await searchTable(page, name);
  await openFirstRow(page);

  await expect(page.locator("#name")).toHaveValue(name);
  await expect(page.locator("#notes")).toHaveValue(notes);
  await expect(page.locator("#zoneManagerId")).toHaveValue(zoneManager);
  await validateContactCard(page, "#contacts-0", contact);
  await validateContactCard(page, "#billingContact", billingContact);
  await deleteForm(page);
});

test("If no external id was added in the creation, add it now → Verify the Linked column in the table is green", async ({
  page,
}) => {
  const name = "Vendor Update 2" + getId();
  await createVendor(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);
  await page.click("button#search");
  await page.fill("#dialog #email", String(process.env.EMAIL));
  await page.click("#dialog #search");
  await page.click("#organization-0");
  await saveForm(page);

  await resetTable(page);
  await searchTable(page, name);
  await expect(page.locator(`${getCellSelector(2, 1)} [data-value="true"]`)).toBeVisible();
  await openFirstRow(page);
  await deleteForm(page);
});

test("Verify that all fields that have been modified are shown in the table record changes", async ({
  page,
}) => {
  const name = "Vendor Update 3" + getId();
  await createVendor(page, { name });

  await resetTable(page);
  await searchTable(page, name);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText(name);
  await openFirstRow(page);
  await deleteForm(page);
});

test("Verify that all fields that have been modified are displayed in the form record changes", async ({
  page,
}) => {
  const name = "Vendor Update 4" + getId();
  await createVendor(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await expect(page.locator("#name")).toHaveValue(name);
  await deleteForm(page);
});

test("Verify that 'Update Time', 'Updated By' columns are updated", async ({ page }) => {
  const name = "Vendor Update 5" + getId();
  const myName = await getMyName(page);
  await createVendor(page, { name });
  await openFirstRow(page);
  await saveForm(page);
  await editTableColumns(page, ["Update Time", "Updated By"]);
  await searchTable(page, name);

  await scrollTableRight(page);
  const columnCount = await getColumnCount(page);
  const updateTime = await page.locator(getCellSelector(2, columnCount - 2)).textContent();
  const updatedBy = await page.locator(getCellSelector(2, columnCount - 1)).textContent();

  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(updateTime);
  await expect(updatedBy).toBe(myName);
  await resetTable(page);

  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
});

test("Verify that the item can be displayed in another tab when the download button is clicked", async ({
  page,
}) => {
  await openCreatePage(page);
  await uploadFile(page, "#addFile");
  const downloadPromise = page.waitForEvent("download");
  await page.click("#files-0-download");
  await downloadPromise;
});

test("Verify that the item can be deleted when the delete button is clicked", async ({ page }) => {
  await openCreatePage(page);
  const fileName = await uploadFile(page, "#addFile");
  await page.click("#files-0-delete");
  await expect(page.getByText(fileName)).not.toBeVisible();
});

test("Verify Billing Contact section fields can be modified", async ({ page }) => {
  await openCreatePage(page);
  const contact = await fillContactCard(page, "#billingContact");
  await validateContactCard(page, "#billingContact", contact);
});

test("Verify Contact section field can be modified", async ({ page }) => {
  await openCreatePage(page);
  await page.click("#addContact");
  const contact = await fillContactCard(page, "#contacts-0");
  await validateContactCard(page, "#contacts-0", contact);
});
