import { expect, test } from "@playwright/test";
import { deleteForm, saveForm, signIn } from "@/utils";
import { createCampaign, openCampaignsTable } from "@/utils/data/campaign";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(2 * 60000);
  await signIn(page);
  await openCampaignsTable(page);
});

test("Create Campaign", async ({ page }) => {
  const name = "Campaign 1";
  await createCampaign(page, { name, createNew: true });
});

test("Review Campaign", async ({ page }) => {
  const name = "Campaign 2";
  await createCampaign(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await expect(page.locator("#name")).toHaveValue(name);
});

test("Update Campaign", async ({ page }) => {
  const name = "Campaign 3";
  await createCampaign(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await page.fill("#name", `${name} Updated`);
  await saveForm(page);
});

test("Delete Campaign", async ({ page }) => {
  const name = "Campaign 4";
  await createCampaign(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
});
