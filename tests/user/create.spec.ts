import { expect, test } from "@playwright/test";
import { getId, saveForm, signIn, uploadFile } from "@/utils";
import { addRoleToUser, openUsersTable } from "@/utils/data/user";
import { selectAddress, selectOption } from "@/utils/input";
import { openCreatePage, openFirstRow, searchTable, testImport } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  await signIn(page);
  await openUsersTable(page);
  await openCreatePage(page);
});

test("Verify that a user cannot be created if all required fields are not completed: First Name, Last Name, Email", async ({
  page,
}) => {
  await page.fill("#password", String(process.env.PASSWORD));
  await page.click("#save");
  await expect(page.locator("#error")).toContainText(
    "Email Required, First Name Required, Last Name Required",
  );
});

test("Verify that the email is filled with valid format: [test]@[gmail].[com]", async ({
  page,
}) => {
  await page.fill("#firstName", "First");
  await page.fill("#lastName", "Last");
  await page.fill("#email", "email");
  await page.fill("#password", String(process.env.PASSWORD));
  await page.click("#save");
  await expect(page.locator("#error")).toContainText("Email Invalid");
});

test("Verify that the inserted address can be selected from the options displayed in the Google drop-down list", async ({
  page,
}) => {
  await selectAddress(page, "#address");
});

test("Verify that the phone is filled with valid information: no letters, except '+'", async ({
  page,
}) => {
  await page.fill("#phone", "a+12223334444");
  await page.click("#title");
  await expect(page.locator("#phone")).toHaveValue("+1 (222) 333-4444");
});

test("Verify Title and Notes can be filled", async ({ page }) => {
  await page.fill("#title", "Title");
  await page.fill("#notes", "Notes");
});

test("Verify that roles can be selected and deselected", async ({ page }) => {
  await page.click("#isAccountManager");
  await expect(page.locator("#isAccountManager")).toBeChecked();
});

test("Verify at least one Role is required", async ({ page }) => {
  await page.fill("#firstName", "First");
  await page.fill("#lastName", "Last");
  await page.fill("#email", "test@email.com");
  await page.fill("#password", String(process.env.PASSWORD));
  await page.click("#save");
  await expect(page.locator("#error")).toContainText("Select at least one role");
});

test("Account Manager → Service Delivery Manager field is displayed in the Profile section", async ({
  page,
}) => {
  await addRoleToUser(page, "Service Delivery Manager");
  await page.click("#isAccountManager");
  await selectOption(page, "#serviceDeliveryManagerId");
});

test("Service Delivery Manager → Account Managers section is displayed", async ({ page }) => {
  const id = getId();
  await addRoleToUser(page, "Service Delivery Manager");

  await page.fill("#firstName", id);
  await page.fill("#lastName", id);
  await page.fill("#email", `${id}@email.com`);
  await page.click("#isAccountManager");
  await page.fill("#password", String(process.env.PASSWORD));
  await selectOption(page, "#serviceDeliveryManagerId");
  await saveForm(page);

  await searchTable(page, String(process.env.EMAIL));
  await openFirstRow(page);
  const accountManagers = await page.locator("#accountManagers").textContent();
  await expect((accountManagers || "").length).toBeGreaterThan(0);
});

test("Verify at least one item can be uploaded", async ({ page }) => {
  await openUsersTable(page);
  await testImport(page, "Users.csv");
});

test("Verify File card can be expanded and contracted", async ({ page }) => {
  await page.click("#files-close");
  await page.click("#files-open");
});

test("Verify a profile photo can be uploaded and displayed in the profile picture", async ({
  page,
}) => {
  await uploadFile(page, "#image");
  const imgSelector = "img";
  await expect(page.locator(imgSelector)).toBeVisible();
  const uploadedPhotoSrc = await page.locator(imgSelector).getAttribute("src");
  expect(uploadedPhotoSrc).toContain("blob:");
});
