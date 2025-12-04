import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { signIn, uploadFile } from "@/utils";
import { fillContactCard, validateContactCard } from "@/utils/contact";
import { clientTimeout, openClientsTable } from "@/utils/data/client";
import { addRoleToUser } from "@/utils/data/user";
import { selectOption, toggleCheckbox } from "@/utils/input";
import { openCreatePage } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(clientTimeout);
  await signIn(page);
  await openClientsTable(page);
  await openCreatePage(page);
});
//update for this secction
test("verify that a client cannot be created if all required fields are not completed: Name", async ({
  page,
}) => {
  await page.click("#create");
  await expect(page.getByText("Name Required")).toBeVisible();
});
//update for this secction
test("verify that the client's name is displayed in the Profile section after selection", async ({ page }) => {
  await page.fill("#Search", "Walmart");
  await page.click("xpath=/html/body/div[2]/div[2]/div[2]/div/div/div[2]/div[2]/div/div[1]/div[3]/div/a/div");

  const nameLocator = page.locator("xpath=/html/body/div[2]/div[2]/div[2]/div/div/div[2]/div[2]/div/div[2] >> text=Walmart");
  await expect(nameLocator).toBeVisible();
});
//update for this secction  
/*test("verify that the Account Manager field displays options (if any) and an option can be selected", async ({
  page,
}) => {
  await addRoleToUser(page, "Account Manager");
  await selectOption(page, "#accountManagerId");
});*/

test("Verify Notes can be filled", async ({ page }) => {
  await page.fill("#editor", "Test");
  await expect(page.locator("#notes")).toHaveValue("Test");
});

test("Verify that the Priority field is displayed with the options: High, Low, Medium → and verify an option can be selected", async ({
  page,
}) => {
  await page.click("#priority");
  await expect(page.locator("text=High")).toBeVisible();
  await expect(page.locator("text=Low")).toBeVisible();
  await expect(page.locator("text=Medium")).toBeVisible();
  await page.locator("text=High").click();
  await expect(page.locator("#priority")).toHaveValue("High");
});

test("Verify that Client checkbox is selected", async ({ page }) => {
  await expect(page.locator("#isClient")).toBeChecked();
});

test("Verify that Client and Vendor options can be selected and deselected", async ({ page }) => {
  await toggleCheckbox(page, "#isClient");
  await toggleCheckbox(page, "#isVendor");
});

test("If QB is integrated, verify that within Profile section, QuickBooks Customer field is displayed and an option can be selected", async ({
  page,
}) => {
  await page.click("#avatar");
  await page.click("#settings");
  const text = await page.textContent("#connect, #reconnect");
  if (text === "Reconnect") {
    await openClientsTable(page);
    await openCreatePage(page);
    await expect(page.locator("#quickBooksCustomerId")).toBeVisible();
    await page.click("#quickBooksCustomerId");
    await expect(page.locator("[id^='quickBooksCustomerId-']").first()).toBeVisible();
  }
});

test("Verify that the Billing Contact section is displayed with the following fields: First Name, Last Name, Email, Phone, Address, Secondary Address", async ({
  page,
}) => {
  await fillContactCard(page, "#billingContact");
});

test("Verify that the Billing Contact section can be filled", async ({ page }) => {
  const contact = await fillContactCard(page, "#billingContact");
  await validateContactCard(page, "#billingContact", contact);
});

test("Verify that the 'Add Contact' button is available at the top right in the Billing Contact section", async ({
  page,
}) => {
  await expect(page.locator("#addContact")).toBeVisible();
});

test("Verify that the Contact section can be filled", async ({ page }) => {
  await page.click("#addContact");
  await page.locator("#contacts-0-email").fill("john.doe");
  await page.click("#save");
  await expect(page.locator("#error")).toHaveText("Name Required, Contacts: 1: Email Invalid");

  const contact = await fillContactCard(page, "#contacts-0");
  await validateContactCard(page, "#contacts-0", contact);
  await page.click("#save");
  await expect(page.locator("#error")).not.toHaveText("Name Required, Contacts: 1: Email Invalid");
});

test("Verify at least one file can be uploaded", async ({ page }) => {
  const text = fs.readFileSync(path.join(__dirname, "../../files/Clients.csv"), "utf8");

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.click("#addFile");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([
    {
      name: "Clients.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(text, "utf8"),
    },
  ]);
  await expect(page.getByText("Clients.csv")).toBeVisible();
});

test("Verify File card can be expanded and contracted", async ({ page }) => {
  const text = fs.readFileSync(path.join(__dirname, "../../files/Clients.csv"), "utf8");

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.click("#addFile");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([
    { name: "Clients.csv", mimeType: "text/csv", buffer: Buffer.from(text, "utf8") },
  ]);
  await expect(page.getByText("Clients.csv")).toBeVisible();

  await page.click("#files-close");

  await expect(page.getByText("Clients.csv")).not.toBeVisible();
  await page.click("#files-open");
  await expect(page.getByText("Clients.csv")).toBeVisible();
});

test("Verify a profile photo can be uploaded and displayed in the profile picture", async ({
  page,
}) => {
  await uploadFile(page, ".bg-slate-200.w-24.h-24.rounded-full.cursor-pointer");
  const imgSelector = "img";
  await expect(page.locator(imgSelector)).toBeVisible();
  const uploadedPhotoSrc = await page.locator(imgSelector).getAttribute("src");
  expect(uploadedPhotoSrc).toContain("blob:");
});
