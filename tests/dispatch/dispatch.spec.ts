import test from "@playwright/test";
import { signIn } from "@/utils";
import { createDispatch, dispatchZonePrefix } from "@/utils/data/dispatch";

test.beforeEach(async ({ page }) => {
  test.setTimeout(3.5 * 60000);
  await signIn(page);
});

test("Dispatch by clients", async ({ page }) => {
  const number = dispatchZonePrefix + 1;
  await createDispatch(page, { number, mode: "clients" });
});

test("Dispatch by zones", async ({ page }) => {
  const number = dispatchZonePrefix + 2;
  await createDispatch(page, { number, mode: "zones" });
});

test("Dispatch by clients, zones, and routes", async ({ page }) => {
  const number = dispatchZonePrefix + 3;
  await createDispatch(page, { number, mode: "routes" });
});
