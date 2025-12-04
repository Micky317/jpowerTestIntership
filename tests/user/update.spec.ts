import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { deleteForm, saveForm, signIn } from "@/utils";
import { createUser, deleteUser, openUsersTable, updateUser } from "@/utils/data/user";
import { testDownload } from "@/utils/input";
import {
  editTableColumns,
  getCellSelector,
  openFirstRow,
  resetTable,
  scrollTableRight,
  searchTable,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(1.5 * 60000);
  await signIn(page);
  await openUsersTable(page);
});

test("Verify that all fields can be modified within the form", async ({ page }) => {
  const name = "User Update 1";
  await createUser(page, { name });
  await updateUser(page, { name });
  await deleteUser(page, name);
});

test("Verify that all fields that have been modified are shown in the table record changes", async ({
  page,
}) => {
  const name = "User Update 2";
  await createUser(page, { name });
  await updateUser(page, { name });
  await searchTable(page, name);

  await expect(page.locator(getCellSelector(2, 0))).toHaveText("Updated " + name);
  await deleteUser(page, name);
});

test("Verify that all fields that have been modified are displayed in the form record changes", async ({
  page,
}) => {
  const name = "User Update 3";
  await createUser(page, { name });
  await updateUser(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);

  await expect(page.locator("#firstName")).toHaveValue("Updated " + name);
  await expect(page.locator("#lastName")).toHaveValue("Updated " + name);
  await expect(page.locator("#address-line2")).toHaveValue("line 3");
  await expect(page.locator("#phone")).toHaveValue("(222) 222-2222");
  await expect(page.locator("#notes")).toHaveValue("updated notes");
  await expect(page.locator("#title")).toHaveValue("updated title");
  await deleteForm(page);
});

test("Verify that 'Update Time', 'Updated By' columns are updated", async ({ page }) => {
  const name = "User Update 4";
  await createUser(page, { name });
  await updateUser(page, { name });
  await editTableColumns(page, ["Update Time"]);
  await searchTable(page, name);

  await scrollTableRight(page);
  const updateTime = await page.locator(getCellSelector(2, 9)).textContent();

  await openFirstRow(page);
  await saveForm(page);

  await searchTable(page, name);

  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(updateTime);
  await resetTable(page);
  await deleteUser(page, name);
});

test("Verify that the item can be displayed in another tab when the download button is clicked", async ({
  page,
}) => {
  const name = "User Update 5";
  await createUser(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await testDownload(page, name);
  await deleteUser(page, name);
});

test("Verify that the item can be deleted when the delete button is clicked", async ({ page }) => {
  const name = "User Update 6";
  await createUser(page, { name });
  await deleteUser(page, name);
});
