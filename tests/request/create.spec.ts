import test, { expect } from "@playwright/test";
import { signIn } from "@/utils";
import { createProperty } from "@/utils/data/property";
import { createRequest, openRequestsTable, requestTimeout } from "@/utils/data/request";
import { selectOption } from "@/utils/input";
import { openCreatePage } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(requestTimeout);
  await signIn(page);
});

test("Verify that a request cannot be created if all required fields are not completed: Name, Property and Reason", async ({
  page,
}) => {
  await openRequestsTable(page);
  await openCreatePage(page);
  await page.click("#save");
  await expect(page.locator("#error")).toHaveText(
    "Name Required, Property Id Required, Reason Required",
  );
});

test("Verify that the request fields can be filled", async ({ page }) => {
  const name = "Request Create 3";
  await createProperty(page, { name });
  await openRequestsTable(page);

  await openCreatePage(page);
  await page.fill("#name", name);
  await selectOption(page, "#propertyId");
  await selectOption(page, "#reason", "ETA Request");
});

test("Verify that the request can be created", async ({ page }) => {
  await createRequest(page, { name: "Request Create 3" });
});
