import test, { expect } from "@playwright/test";
import { saveForm, signIn } from "@/utils";
import { bailoutTimeout, bailoutZonePrefix, createBailout } from "@/utils/data/bailout";
import { openCampaignsTable } from "@/utils/data/campaign";
import { createDispatch } from "@/utils/data/dispatch";
import { selectOption } from "@/utils/input";
import { getCellSelector, openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(bailoutTimeout);
  await signIn(page);
});

test("Verify that a new Bailout is listed", async ({ page }) => {
  const name = "Bailout Review 1";
  await createBailout(page, { name });

  await expect(page.locator(getCellSelector(2, 0))).toHaveText("Pending");
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(name);
  await expect(page.locator(getCellSelector(2, 3))).toHaveText(name);
});

test("Verify that a new Bailout created by an event is listed", async ({ page }) => {
  const name = "Bailout Review 2";
  await createBailout(page, { name });

  await expect(page.locator(getCellSelector(2, 0))).toHaveText("Pending");
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(name);
});

test("Verify that a new Bailout created by a snow campaign is listed", async ({ page }) => {
  const number = bailoutZonePrefix + 3;
  const name = `Bailout Review ${number}`;
  const { name: dispatchName } = await createDispatch(page, { number, mode: "clients" });

  await openCampaignsTable(page);
  await searchTable(page, dispatchName);
  await openFirstRow(page);
  await page.click("#bailout");

  await selectOption(page, "#vendorId", name);
  await saveForm(page);

  await searchTable(page, name);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText("Pending");
  await expect(page.locator(getCellSelector(2, 1))).toHaveText(name);
});
