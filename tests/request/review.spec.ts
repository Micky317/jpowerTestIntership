import { expect, test } from "@playwright/test";
import { getMyName, signIn } from "@/utils";
import { createRequest, requestTimeout } from "@/utils/data/request";
import {
  editTableColumns,
  getCellSelector,
  getRowCount,
  resetTable,
  searchTable,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(requestTimeout);
  await signIn(page);
});

test("Verify that all the information entered when creating the request is displayed in the table: First Name, Last Name, Roles, Email, Phone, Id", async ({
  page,
}) => {
  const name = "Request Review 1";
  const reason = "ETA Request";
  await createRequest(page, { name, reason });
  await searchTable(page, name);

  await expect(page.locator(getCellSelector(2, 0))).toHaveText(name);
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(name);
  await expect(page.locator(getCellSelector(2, 2))).toHaveText(reason);
});

test("Verify that the number of rows displayed in the top corner of the table corresponds to the total number of request", async ({
  page,
}) => {
  const name = "Request Review 2";
  await createRequest(page, { name });
  await searchTable(page, name);

  await searchTable(page, name);
  await expect(await getRowCount(page)).toBe(1);
});

test("Verify that the 'Created By' column is populated with the name of the corresponding user name who created the request", async ({
  page,
}) => {
  const name = "Request Review 3";
  await createRequest(page, { name });
  await searchTable(page, name);

  const myName = await getMyName(page);
  await editTableColumns(page, ["Created By"]);
  await expect(page.locator(getCellSelector(2, 8))).toHaveText(myName);
  await resetTable(page);
});
