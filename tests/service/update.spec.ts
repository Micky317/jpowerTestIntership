import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { getMyName, saveForm, signIn } from "@/utils";
import { createService, openServicesTable, serviceTimeout } from "@/utils/data/service";
import {
  editTableColumns,
  getCellSelector,
  getColumnCount,
  openFirstRow,
  resetTable,
  searchTable,
} from "@/utils/table";

const order = "2";
const isTimeAndMaterial = "false";

test.beforeEach(async ({ page }) => {
  test.setTimeout(serviceTimeout);
  await signIn(page);
  await openServicesTable(page);
});

test("Verify that all fields can be modified within the form", async ({ page }) => {
  const name = "Service Update 1";
  await createService(page, { name });

  await openFirstRow(page);
  await page.fill("#name", name);
  await page.fill("#order", order);
  const isTAndM = await page.locator("#isTimeAndMaterial").getAttribute("data-value");
  if (isTAndM !== isTimeAndMaterial) await page.click("#isTimeAndMaterial");
  await saveForm(page);
});

test("Verify that all fields that have been modified are shown in the table record changes", async ({
  page,
}) => {
  const name = "Service Update 2";
  await createService(page, { name, order });

  await resetTable(page);
  await searchTable(page, name);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText(name);
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(order);
  await expect(page.locator(`${getCellSelector(2, 2)} [data-value="false"]`)).toBeVisible();
});

test("Verify that all fields that have been modified are displayed in the form record changes", async ({
  page,
}) => {
  const name = "Service Update 3";
  await createService(page, { name, order });

  await searchTable(page, name);
  await openFirstRow(page);
  await expect(page.locator("#name")).toHaveValue(name);
  await expect(page.locator("#order")).toHaveValue(order);
  await expect(await page.locator("#isTimeAndMaterial").getAttribute("data-value")).toEqual(
    isTimeAndMaterial,
  );
});

test("Verify that 'Update Time', 'Updated By' columns are updated", async ({ page }) => {
  const name = "Service Update 4";
  await createService(page, { name, order });

  const myName = await getMyName(page);
  await searchTable(page, name);
  await openFirstRow(page);
  await saveForm(page);

  await editTableColumns(page, ["Update Time", "Updated By"]);
  await searchTable(page, name);
  const columnCount = await getColumnCount(page);

  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(
    await page.locator(getCellSelector(2, columnCount - 2)).textContent(),
  );

  await expect(page.locator(getCellSelector(2, columnCount - 1))).toHaveText(myName);
  await resetTable(page);
});
