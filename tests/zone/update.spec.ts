import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { getMyName, saveForm, signIn } from "@/utils";
import { createZone, openZonesTable } from "@/utils/data/zone";
import { selectOption } from "@/utils/input";
import {
  editTableColumns,
  getCellSelector,
  openFirstRow,
  resetTable,
  searchTable,
} from "@/utils/table";

const number = "2";
const name = `Zone ${number}`;
const zipCodes = "67890";

test.beforeEach(async ({ page }) => {
  await signIn(page);
  await openZonesTable(page);
});

test("Verify that all fields can be modified within the form", async ({ page }) => {
  await openFirstRow(page);
  await page.fill("#number", number);
  await selectOption(page, "#zoneManagerId");
  await page.fill("#zipCodes", zipCodes);
  await page.click("#save");
  await page.waitForURL("**/zone");
});

test("Verify that all fields that have been modified are shown in the table record changes", async ({
  page,
}) => {
  await resetTable(page);
  const myName = await getMyName(page);
  const number = await createZone(page, { zoneManager: myName });
  await searchTable(page, `Zone ${number}`);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText(`Zone ${number}`);
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(myName);
});

test("Verify that all fields that have been modified are displayed in the form record changes", async ({
  page,
}) => {
  const myName = await getMyName(page);
  const number = await createZone(page, { zoneManager: myName, zipCodes });
  await searchTable(page, `Zone ${number}`);
  await openFirstRow(page);
  await expect(page.locator("#number")).toHaveValue(number.toString());
  await expect(page.locator("#zoneManagerId")).toHaveValue(myName);
  await expect(page.locator("#zipCodes")).toHaveValue(zipCodes);
});

test("Verify that 'Update Time', 'Updated By' columns are updated", async ({ page }) => {
  const myName = await getMyName(page);
  await searchTable(page, name);
  await openFirstRow(page);
  await saveForm(page);

  await editTableColumns(page, ["Update Time", "Updated By"]);
  await searchTable(page, name);

  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(
    await page.locator(getCellSelector(2, 4)).textContent(),
  );

  await expect(page.locator(getCellSelector(2, 5))).toHaveText(myName);
  await resetTable(page);
});
