import { expect, test } from "@playwright/test";
import { deleteForm, saveForm, signIn } from "@/utils";
import { createEvent } from "@/utils/data/event";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(2 * 60000);
  await signIn(page);
});

test("Create Event", async ({ page }) => {
  const name = "Event 1";
  await createEvent(page, { name, createNew: true });
});

test("Review Event", async ({ page }) => {
  const name = "Event 2";
  await createEvent(page, { name });
  await searchTable(page, name);

  await openFirstRow(page);
  await page.waitForURL("**/event/**");
  await expect(page.locator("#propertyId")).toBeVisible();
});

test("Update Event", async ({ page }) => {
  const name = "Event 3";
  await createEvent(page, { name });
  await openFirstRow(page);
  await page.waitForSelector("#propertyId");
  await saveForm(page);
});

test("Delete Event", async ({ page }) => {
  const name = "Event 4";
  await createEvent(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);

  await page.waitForSelector("#propertyId");
  await page.click("#breadcrumb-1");
  await page.waitForURL("**/event/**");
  await page.waitForSelector("#propertyId");
  await deleteForm(page);
});
