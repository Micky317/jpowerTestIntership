import { expect, Page, test } from "@playwright/test";
import { signIn } from "@/utils";
import { createProperty } from "@/utils/data/property";

test.beforeEach(async ({ page }) => {
  test.setTimeout(1.5 * 60000);
  await signIn(page);
});

const openMap = async (page: Page) => {
  if (!(await page.isVisible("#map"))) await page.click("#duringEvent");
  await page.click("#map");
  await page.waitForURL("**/live-map");
  await page.waitForTimeout(1000);
};

test("Check Pin for properties is displayed", async ({ page }) => {
  const name = "Map 1";
  await createProperty(page, { name });
  await openMap(page);

  const pinSelector = `gmp-advanced-marker[aria-label="${name}"]`;
  await page.waitForSelector(pinSelector, { timeout: 5000 });

  const pinExists = await page.isVisible(pinSelector);
  expect(pinExists).toBeTruthy();

  const pinTitle = await page.getAttribute(pinSelector, "title");
  expect(pinTitle).toBe(name);
});

test("Click a Pin displays event form", async ({ page }) => {
  const name = "Map 2";
  await createProperty(page, { name });
  await openMap(page);

  const pinSelector = `gmp-advanced-marker`;
  await page.waitForSelector(pinSelector, { timeout: 5000 });
  await page.locator(pinSelector).first().click({ force: true });
  await page.waitForTimeout(1000);
  await expect(await page.isVisible("#dialog")).toBeTruthy();
});

test("Check Filter works for pins", async ({ page }) => {
  const name = "Map 3";
  await createProperty(page, { name });
  await openMap(page);

  const pinSelector = `gmp-advanced-marker[aria-label="${name}"]`;
  await page.waitForSelector(pinSelector, { timeout: 5000 });

  await page.click("#status");
  await page.fill("#status", "VP Approved");
  await page.click("#status");
  await page.waitForTimeout(500);
  await page.click(`[data-text="VP Approved"]`);
  await page.waitForTimeout(3000);

  const pinExists = await page.isVisible(pinSelector);
  expect(pinExists).toBeFalsy();
});
