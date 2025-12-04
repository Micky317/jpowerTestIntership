import { expect, test } from "@playwright/test";
import { signIn } from "@/utils";
import { addRoleToUser } from "@/utils/data/user";
import { openZonesTable } from "@/utils/data/zone";
import { selectOption } from "@/utils/input";
import { openCreatePage } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  await signIn(page);
  await openZonesTable(page);
  await openCreatePage(page);
});

test("Verify that a zone cannot be created if all required fields are not completed: Number", async ({
  page,
}) => {
  await page.click("#save");
  await expect(page.locator("#error")).toHaveText("Number Required");
});

test("Verify that the Zone Manager field displays options (if any) and an option can be selected", async ({
  page,
}) => {
  await addRoleToUser(page, "Zone Manager");
  await selectOption(page, "#zoneManagerId");
});

test("Verify Zip Codes field can be filled", async ({ page }) => {
  await page.fill("#zipCodes", "12345");
  await expect(page.locator("#zipCodes")).toHaveValue("12345");
});
