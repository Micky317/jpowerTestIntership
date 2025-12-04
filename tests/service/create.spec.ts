import { expect, test } from "@playwright/test";
import { saveForm, signIn } from "@/utils";
import { openServicesTable, serviceTimeout } from "@/utils/data/service";
import { selectOption, toggleCheckbox } from "@/utils/input";
import { connectQuickBooks } from "@/utils/quickBooks";
import { openCreatePage } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(serviceTimeout);
  await signIn(page);
});

test("Create service", async ({ page }) => {
  const name = "Create 1";
  await openServicesTable(page);
  await openCreatePage(page);
  await page.fill("#name", name);
  await saveForm(page);
});

test("Verify that a service cannot be created if all required fields are not completed: Name", async ({
  page,
}) => {
  await openServicesTable(page);
  await openCreatePage(page);
  await page.click("#save");
  await expect(page.locator("#error")).toHaveText("Name Required");
});

test("Verify Is Time And Material can be selected and deselected", async ({ page }) => {
  await openServicesTable(page);
  await openCreatePage(page);
  await toggleCheckbox(page, "#isTimeAndMaterial");
});

test("Verify Order can be filled with just only numbers", async ({ page }) => {
  await openServicesTable(page);
  await openCreatePage(page);
  await expect(page.locator("#order[type='number']")).toBeVisible();
});

test("If QB is integrated, verify that within Service section, QuickBooks Item field is displayed and an option can be selected", async ({
  page,
}) => {
  await connectQuickBooks(page);
  await openServicesTable(page);
  await openCreatePage(page);
  await selectOption(page, "#quickBooksItem-id");
});
