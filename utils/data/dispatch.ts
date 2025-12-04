import { Page } from "@playwright/test";
import dayjs from "dayjs";
import { createCampaign } from "./campaign";
import { createClient } from "./client";
import { createContract } from "./contract";
import { createVendor } from "./vendor";
import { createZone } from "./zone";

export const createDispatch = async (
  page: Page,
  dispatch: { number: number; mode: "clients" | "zones" | "routes" },
) => {
  const name = `Dispatch ${dispatch.number}`;
  await createClient(page, { name });
  await createZone(page, { number: dispatch.number });
  await createContract(page, { name, zone: dispatch.number, createClient: true });
  await createVendor(page, { name: `${name} Vendor` });
  await createCampaign(page, { name, zone: dispatch.number });

  await openDispatchPage(page);

  if (dispatch.mode === "routes") await page.click("#clientsZonesRoutes");
  else await page.click(`#${dispatch.mode}`);

  if (dispatch.mode === "clients" || dispatch.mode === "routes") {
    await page.locator('input[type="checkbox"]').first().check();
    await page.click("#next");
  }

  if (dispatch.mode === "zones" || dispatch.mode === "routes") {
    await page.locator('input[type="checkbox"]').first().check();
    await page.click("#next");
  }

  await page.fill("#date", dayjs().format("YYYY-MM-DD"));
  await page.click("#cycle-0");
  await page.click("button#dispatch");
  await page.waitForURL("/event");
  return { name };
};

export const dispatchZonePrefix = 10;

export const openDispatchPage = async (page: Page) => {
  if (!(await page.isVisible("#dispatch"))) await page.click("#beforeEvent");
  await page.click("#dispatch");
  await page.waitForURL("/dispatch");
};
