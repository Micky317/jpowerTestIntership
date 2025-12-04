import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { deleteForm, saveForm, signIn } from "@/utils";
import {
  createProperty,
  deleteProperty,
  openPropertiesTable,
  propertyTimeout,
  updateProperty,
} from "@/utils/data/property";
import {
  editTableColumns,
  getCellSelector,
  getColumnCount,
  openFirstRow,
  resetTable,
  scrollTableRight,
  searchTable,
  sortColumn,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(propertyTimeout);
  await signIn(page);
});

test("Verify that all fields can be modified within the form property", async ({ page }) => {
  const name = "Property Update 1";
  await createProperty(page, { name });

  await updateProperty(page, name);
  await deleteProperty(page, "Edited " + name);
});

test("Verify that all fields that have been modified are shown in the table record changes property", async ({
  page,
}) => {
  const name = "Property Update 2";
  await createProperty(page, { name });

  await updateProperty(page, name);
  await searchTable(page, "Edited " + name);
  await expect(page.locator(getCellSelector(2, 1))).toHaveText("Edited " + name);
  await deleteProperty(page, "Edited " + name);
});

test("Verify that all fields that have been modified are displayed in the form record changes property", async ({
  page,
}) => {
  const name = "Property Update 3";
  await createProperty(page, { name });

  await updateProperty(page, name);
  await searchTable(page, "Edited " + name);
  await openFirstRow(page);

  await expect(page.locator("#name")).toHaveValue("Edited " + name);
  await expect(page.locator("#shortId")).toHaveValue("Edited " + name);
  await expect(page.locator("#notes")).toHaveValue("Edited test");

  await openPropertiesTable(page);
  await searchTable(page, "Edited " + name);
  await openFirstRow(page);
  await deleteForm(page);
});

test("Verify that 'Update Time', 'Updated By' columns are updated property", async ({ page }) => {
  const name = "Property Update 4";
  await createProperty(page, { name });
  await updateProperty(page, name);

  await editTableColumns(page, ["Update Time"]);
  await searchTable(page, name);
  await scrollTableRight(page);
  await sortColumn(page, "Update Time", "descending");

  const columnCount = await getColumnCount(page);
  const updateTime = await page.textContent(getCellSelector(2, columnCount));

  await openFirstRow(page);
  await saveForm(page);

  await resetTable(page);
  await searchTable(page, name);

  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(updateTime);

  await resetTable(page);
  await deleteProperty(page, name);
});
