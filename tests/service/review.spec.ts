import { expect, test } from "@playwright/test";
import { DATE_REGEX, getId, getMyName, ID_REGEX, saveForm, signIn } from "@/utils";
import { createService, openServicesTable, serviceTimeout } from "@/utils/data/service";
import {
  editTableColumns,
  getCellSelector,
  getRowCount,
  openCreatePage,
  openFirstRow,
  resetTable,
  scrollTableRight,
  searchTable,
  testColumnReposition,
} from "@/utils/table";

const order = "1";
const isTimeAndMaterial = "true";

test.beforeEach(async ({ page }) => {
  test.setTimeout(serviceTimeout);
  await signIn(page);
  await openServicesTable(page);
  await resetTable(page);
});

test("Verify that all the information entered when creating the service is displayed in the table: Name, Order, T&M, Created At, Id", async ({
  page,
}) => {
  const name = getId();
  await openCreatePage(page);
  await page.fill("#name", name);
  await page.fill("#order", order);
  if (isTimeAndMaterial === "true") await page.click("#isTimeAndMaterial");
  await saveForm(page);

  await searchTable(page, name);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText(name);
  await expect(page.locator(getCellSelector(2, 1))).toHaveText("1");
  await expect(page.locator(`${getCellSelector(2, 2)} [data-value="true"]`)).toBeVisible();
  await expect(await page.locator(getCellSelector(2, 5)).textContent()).toMatch(DATE_REGEX);
  await expect(await page.locator(getCellSelector(2, 6)).textContent()).toMatch(ID_REGEX);
});

test("Verify that the number of rows displayed in the top corner of the table corresponds to the total number of records", async ({
  page,
}) => {
  const name = "Service 2";
  await createService(page, { name });
  await searchTable(page, name);
  await expect(await getRowCount(page)).toBe(1);
});

test("Verify that all the information entered when creating the service is displayed in the form when selecting the service created", async ({
  page,
}) => {
  const name = (await page.locator(getCellSelector(2, 0)).textContent()) || "";
  await openFirstRow(page);
  await expect(page.locator("#name")).toHaveValue(name);
});

test("Verify that the service's id and name are displayed at the top left of the Profile section: 'Services / [serviceName]'", async ({
  page,
}) => {
  const name = (await page.locator(getCellSelector(2, 0)).textContent()) || "";
  await openFirstRow(page);
  await expect(page.locator("#breadcrumb-1")).toHaveText(name);
});

test("Verify that the '+' icon in the table allows you to add more columns to the table or remove them", async ({
  page,
}) => {
  await resetTable(page);
  await editTableColumns(page, ["Created By"], ["Name"]);
  await expect(page.locator(getCellSelector(0, 0))).not.toHaveText("Name");
  await expect(page.locator(getCellSelector(0, 6))).toHaveText("Created By");
  await resetTable(page);
});

test("Verify that the 'Created By', 'Update Time', 'Updated By' the columns are filled accordingly with name and time according to the service creation", async ({
  page,
}) => {
  const name = await getMyName(page);
  await resetTable(page);
  await editTableColumns(page, ["Created By", "Update Time", "Updated By"]);
  await scrollTableRight(page);
  await expect(page.locator(getCellSelector(2, 7))).toHaveText(name);
  await expect(await page.locator(getCellSelector(2, 8)).textContent()).toMatch(DATE_REGEX);
  await expect(page.locator(getCellSelector(2, 9))).toHaveText(name);
  await resetTable(page);
});

test("Verify that the columns can be repositioned", async ({ page }) => {
  await testColumnReposition(page);
});
