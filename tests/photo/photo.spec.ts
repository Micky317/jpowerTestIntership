import { expect, Page, test } from "@playwright/test";
import { signIn } from "@/utils";
import { createEvent } from "@/utils/data/event";
import { createProperty } from "@/utils/data/property";
import { selectOption } from "@/utils/input";

test.beforeEach(async ({ page }) => {
  test.setTimeout(2.5 * 60000);
  await signIn(page);
});

const beforeEach = async (page: Page, name: string) => {
  await createProperty(page, { name });
  await createEvent(page, { name: `${name} with photos`, addPhotos: true });

  if (!(await page.isVisible("#photos"))) await page.click("#duringEvent");
  await page.click("#photos");
  await page.waitForURL("**/photo");
};

test("Check Photos are listed", async ({ page }) => {
  const name = "Photo 1";
  await beforeEach(page, name);

  await expect(page.locator("#photo-0")).toBeVisible();
  await expect(page.locator("#photo-1")).toBeVisible();
  await expect(page.locator("#photo-2")).toBeVisible();
  await expect(page.locator("#photo-3")).toBeVisible();
  await expect(page.locator("#photo-4")).toBeVisible();
  await expect(page.locator("#photo-5")).toBeVisible();
});

test("Check Property filtering works", async ({ page }) => {
  const name = "Photo 2";
  await beforeEach(page, name);

  await expect(page.locator("#photo-0")).toBeVisible();
  await selectOption(page, "#property", name);
  await page.waitForTimeout(1000);
  await expect(page.getByText("No records found", { exact: true })).toBeVisible({
    timeout: 15 * 1000,
  });
});

test("Check export photo works", async ({ page }) => {
  const name = "Photo 3";
  await beforeEach(page, name);

  await page.waitForSelector("#photo-0");
  await page.check("#export-0");
  await page.click("#export");
  await page.waitForSelector("#dialog");

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.click("#dialog button#export"),
  ]);
  const localPath = "./downloads/exported-image.png";
  await download.saveAs(localPath);

  const mimeType = (await download.failure()) || download.suggestedFilename();
  console.log(`Downloaded file type: ${mimeType}`);
  expect(
    mimeType.endsWith(".png") || mimeType.endsWith(".jpg") || mimeType.endsWith(".pdf"),
  ).toBeTruthy();
});
