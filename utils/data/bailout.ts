import { Page } from "@playwright/test";
import { saveForm } from "..";
import { selectOption } from "../input";
import { getRowCount, openCreatePage, searchTable } from "../table";
import { createEvent } from "./event";
import { createVendor } from "./vendor";

export const bailoutZonePrefix = 0;

export const bailoutTimeout = 3 * 60000;

export const createBailout = async (page: Page, bailout: { name: string; createNew?: boolean }) => {
  if (!bailout.createNew) {
    await openBailoutsTable(page);
    await searchTable(page, bailout.name);
    if (await getRowCount(page)) return;
  }

  await createEvent(page, { name: bailout.name });
  await createVendor(page, { name: bailout.name });
  await openBailoutsTable(page);
  await openCreatePage(page);

  await selectOption(page, "#eventId");
  await selectOption(page, "#contractType");
  await selectOption(page, "#vendorId", bailout.name);
  await selectOption(page, "#originalVendorId", bailout.name);
  await page.fill("#amount", "500");
  await page.fill("#status", "Pending");
  await saveForm(page);
};

export const openBailoutsTable = async (page: Page) => {
  await page.goto("/bailout");
  await page.waitForURL("**/bailout");
  await page.waitForSelector("#search");
};
