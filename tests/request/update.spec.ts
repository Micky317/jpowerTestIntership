import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { saveForm, signIn } from "@/utils";
import {
  createRequest,
  deleteRequest,
  openRequestsTable,
  requestTimeout,
} from "@/utils/data/request";
import { selectOption } from "@/utils/input";
import {
  editTableColumns,
  getCellSelector,
  getColumnCount,
  openFirstRow,
  resetTable,
  searchTable,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(requestTimeout);
  await signIn(page);
  await openRequestsTable(page);
});

test("Verify that all fields can be modified within the form request", async ({ page }) => {
  const name = "Request Update 1";
  await createRequest(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);

  await page.fill("#name", "Edited " + name);
  await selectOption(page, "#reason", "Extra Service");
  await saveForm(page);

  await deleteRequest(page, "Edited " + name);
});

test("Verify that all fields that have been modified are shown in the table record changes request", async ({
  page,
}) => {
  const name = "Request Update 2";
  await createRequest(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);

  await page.fill("#name", "Edited " + name);
  await selectOption(page, "#reason", "Extra Service");
  await saveForm(page);

  await searchTable(page, "Edited " + name);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText("Edited " + name);
  await deleteRequest(page, "Edited " + name);
});

test("Verify that all fields that have been modified are displayed in the form record changes request", async ({
  page,
}) => {
  const name = "Request Update 3";
  await createRequest(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);

  await page.fill("#name", "Edited " + name);
  await selectOption(page, "#reason", "Extra Service");
  await saveForm(page);

  await searchTable(page, "Edited " + name);
  await openFirstRow(page);

  await expect(page.locator("#name")).toHaveValue("Edited " + name);
  await expect(page.locator("#propertyId")).toHaveValue(name);
  await expect(page.locator("#reason")).toHaveValue("Extra Service");
  await saveForm(page);

  await deleteRequest(page, "Edited " + name);
});

test("Verify that 'Update Time', 'Updated By' columns are updated request", async ({ page }) => {
  const name = "Request Update 4";
  await createRequest(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await saveForm(page);

  await editTableColumns(page, ["Update Time"]);
  await searchTable(page, name);
  const columnCount = await getColumnCount(page);
  const updateTime = await page.textContent(getCellSelector(2, columnCount - 1));

  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(updateTime);

  await resetTable(page);
  await deleteRequest(page, name);
});
