import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { signIn } from "@/utils";
import { openPropertiesTable, propertyTimeout } from "@/utils/data/property";
import { openCreatePage } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(propertyTimeout);
  await signIn(page);
  await openPropertiesTable(page);
  await openCreatePage(page);
});

test("Verify that an item cannot be created if all required fields are not completed: Name, ShortId", async ({
  page,
}) => {
  await page.click("#save");
  await expect(page.locator("#error")).toHaveText("Name Required, Short Id Required");
});

test("Verify that the Property Contact section can be filled", async ({ page }) => {
  const contactSection = page.locator("#contact");
  await contactSection.locator("#contact-firstName").fill("John");
  await contactSection.locator("#contact-lastName").fill("Doe");
  await contactSection.locator("#contact-email").fill("john.doe@example.com");
  await contactSection.locator("#contact-phone").fill("1234567890");
  await contactSection.locator("#contact-secondaryPhone").fill("0987654321");

  await expect(contactSection.locator("#contact-firstName")).toHaveValue("John");
  await expect(contactSection.locator("#contact-lastName")).toHaveValue("Doe");
  await expect(contactSection.locator("#contact-email")).toHaveValue("john.doe@example.com");
  await expect(contactSection.locator("#contact-phone")).toHaveValue("(123) 456-7890");
  await expect(contactSection.locator("#contact-secondaryPhone")).toHaveValue("(098) 765-4321");
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
    {
      name: "Clients.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(text, "utf8"),
    },
  ]);
  await expect(page.getByText("Clients.csv")).toBeVisible();

  await page.click("#files-close");

  await expect(page.getByText("Clients.csv")).not.toBeVisible();
  await page.click("#files-open");
  await expect(page.getByText("Clients.csv")).toBeVisible();
});
