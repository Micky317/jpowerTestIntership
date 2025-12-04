import { expect, test } from "@playwright/test";
import dayjs from "dayjs";
import { getMyName, saveForm, signIn } from "@/utils";
import { createUser, openUsersTable } from "@/utils/data/user";
import {
  editTableColumns,
  getCellSelector,
  getRowCount,
  openFirstRow,
  resetTable,
  scrollTableRight,
  searchTable,
  testColumnReposition,
} from "@/utils/table";

test.beforeEach(async ({ page }) => {
  await signIn(page);
  await openUsersTable(page);
});

test("Verify that all the information entered when creating the user is displayed in the table: First Name, Last Name, Roles, Email, Phone, Id", async ({
  page,
}) => {
  const name = "User Review 1";
  await editTableColumns(page, ["License", "Created At"]);
  const { firstName, lastName, email, phone, role } = await createUser(page, { name });
  await searchTable(page, firstName);

  await expect(page.locator(getCellSelector(2, 0))).toHaveText(firstName);
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(lastName);
  await expect(page.locator(getCellSelector(2, 2))).toHaveText(role);
  await expect(page.locator(getCellSelector(2, 3))).toHaveText(email);
  await expect(page.locator(getCellSelector(2, 4))).toHaveText(phone);

  await scrollTableRight(page);
  const idCell = await page.locator(getCellSelector(2, 8));
  await expect(await idCell.textContent()).toMatch(/[A-Z0-9]{5}/);
});

test("Verify that the number of rows displayed in the top corner of the table corresponds to the total number of records", async ({
  page,
}) => {
  await resetTable(page);
  await searchTable(page, String(process.env.EMAIL));
  await expect(await getRowCount(page)).toBe(1);
});

test("Verify that the 'Created By' column is populated with the name of the corresponding user name who created the user", async ({
  page,
}) => {
  const name = "User Review 3";
  const myName = await getMyName(page);
  await createUser(page, { name });
  await searchTable(page, name);
  await editTableColumns(page, ["Created By"]);
  await expect(page.locator(getCellSelector(2, 9))).toHaveText(myName);
});

test("Verify that all the information entered when creating the user is displayed in the form when selecting the user created", async ({
  page,
}) => {
  const name = "User Review 4";
  const user = await createUser(page, { name });
  await searchTable(page, user.firstName);
  await openFirstRow(page);

  await expect(page.locator("#breadcrumb-1")).toHaveText(`${user.firstName} ${user.lastName}`);
  await expect(page.locator("#firstName")).toHaveValue(user.firstName);
  await expect(page.locator("#lastName")).toHaveValue(user.lastName);
  await expect(page.locator("#email")).toHaveValue(user.email);
  await expect(page.locator("#address")).toHaveValue(user.address);
  await expect(page.locator("#phone")).toHaveValue(user.phone);
  await expect(page.locator("#title")).toHaveValue(user.title);
  await expect(page.locator("#notes")).toHaveValue(user.notes);
  await expect(page.locator(`#is${user.role.replace(/ /g, "")}`)).toHaveAttribute(
    "data-value",
    "true",
  );
});

test("Verify that the '+' icon in the table allows you to add more columns to the table or remove them", async ({
  page,
}) => {
  await editTableColumns(page, ["Created By"], ["First Name"]);
  await expect(page.locator(getCellSelector(0, 0))).toHaveText("Last Name");
  await scrollTableRight(page);
  await expect(page.locator(getCellSelector(0, 8))).toHaveText("Created By");
  await resetTable(page);
});

test("Verify that the 'Created By', 'Update Time', 'Updated By' the columns are filled accordingly with name and time according to the user creation", async ({
  page,
}) => {
  const name = "User Review 6";
  const myName = await getMyName(page);
  const { firstName } = await createUser(page, { name });
  await editTableColumns(page, ["Created By", "Update Time", "Updated By"]);
  await searchTable(page, firstName);
  await openFirstRow(page);
  await saveForm(page);

  await scrollTableRight(page);
  const createdBy = await page.locator(getCellSelector(2, 9)).textContent();
  const updateTime = await page.locator(getCellSelector(2, 10)).textContent();
  const updatedBy = await page.locator(getCellSelector(2, 11)).textContent();

  await expect(createdBy).toBe(myName);
  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, hmm A");
  await expect([now, lastMinute]).toContain(updateTime);
  await expect(updatedBy).toBe(myName);
});

test("Verify that the columns can be repositioned", async ({ page }) => {
  await testColumnReposition(page);
});
