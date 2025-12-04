import { expect, test } from "@playwright/test";
import { DATE_REGEX, getMyName, ID_REGEX, signIn } from "@/utils";
import { addRoleToUser } from "@/utils/data/user";
import { createZone, openZonesTable } from "@/utils/data/zone";
import {
  editTableColumns,
  getCellSelector,
  getRowCount,
  openFirstRow,
  resetTable,
  searchTable,
  testColumnReposition,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(1.5 * 60000);
  await signIn(page);
  await openZonesTable(page);
  await resetTable(page);
});

test("Verify that all the information entered when creating the zone is displayed in the table: Name, Zone Manager (if linked), Created At, Id", async ({
  page,
}) => {
  await resetTable(page);
  await addRoleToUser(page, "Zone Manager");
  const myName = await getMyName(page);

  const number = await createZone(page, { zoneManager: myName });
  await resetTable(page);

  await searchTable(page, String(number));
  await expect(page.locator(getCellSelector(2, 0))).toHaveText(`Zone ${number}`);
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(myName);
  await expect(await page.locator(getCellSelector(2, 2)).textContent()).toMatch(DATE_REGEX);
  await expect(await page.locator(getCellSelector(2, 3)).textContent()).toMatch(ID_REGEX);
});

test("Verify that the number of rows displayed in the top corner of the table corresponds to the total number of records", async ({
  page,
}) => {
  const number = 22;
  await createZone(page, { number });

  await searchTable(page, `Zone ${number}`);
  await expect(await getRowCount(page)).toBe(1);
});

test("Verify that all the information entered when creating the zone is displayed in the form when selecting the zone created", async ({
  page,
}) => {
  const zoneManager = await getMyName(page);
  const number = 23;
  await createZone(page, { number, zoneManager });

  await openFirstRow(page);
  await expect(page.locator("#number")).not.toBeEmpty();
  await expect(page.locator("#zoneManagerId")).not.toBeEmpty();
});

test("Verify that the zone's name is displayed at the top left of the Profile section: 'Zones / Zone [zoneName]'", async ({
  page,
}) => {
  await resetTable(page);
  await openFirstRow(page);
  await expect(await page.locator("#breadcrumb-1").textContent()).toMatch(/Zone \d+/);
});

test("Verify that the '+' icon in the table allows you to add more columns to the table or remove them", async ({
  page,
}) => {
  await editTableColumns(page, ["Created By"], ["Name"]);
  await expect(page.locator(getCellSelector(0, 0))).not.toHaveText("Name");
  await expect(page.locator(getCellSelector(0, 3))).toHaveText("Created By");
  await resetTable(page);
});

test("Verify that the 'Created By', 'Update Time', 'Updated By' the columns are filled accordingly with name and time according to the service creation", async ({
  page,
}) => {
  const name = await getMyName(page);
  await resetTable(page);
  await editTableColumns(page, ["Created By", "Update Time", "Updated By"]);
  await expect(page.locator(getCellSelector(2, 4))).toHaveText(name);
  await expect(await page.locator(getCellSelector(2, 5)).textContent()).toMatch(DATE_REGEX);
  await expect(page.locator(getCellSelector(2, 6))).toHaveText(name);
  await resetTable(page);
});

test("Verify that the columns can be repositioned", async ({ page }) => {
  await testColumnReposition(page);
});
