import test, { expect } from "@playwright/test";
import { signIn } from "@/utils";
import { bailoutTimeout, createBailout, openBailoutsTable } from "@/utils/data/bailout";
import { openCreatePage } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(bailoutTimeout);
  await signIn(page);
  await openBailoutsTable(page);
});

test("Verify that a bailout cannot be created if all required fields are not completed: type and User", async ({
  page,
}) => {
  await openCreatePage(page);
  await page.click("#save");
  await expect(page.locator("#error")).toBeVisible();
});

test("Verify that the bailout fields can be filled", async ({ page }) => {
  const name = "Bailout Create 2";
  await createBailout(page, { name, createNew: true });
});

test("Verify that the bailout can be created", async ({ page }) => {
  const name = "Bailout Create 3";
  await createBailout(page, { name, createNew: true });
});
