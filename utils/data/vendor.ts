import { Page } from "@playwright/test";
import { getId, saveForm } from "@/utils";
import { getRowCount, openCreatePage, resetTable, searchTable } from "@/utils/table";
import { fillContactCard } from "../contact";
import { selectOption } from "../input";

export const createVendor = async (page: Page, vendor: { name: string; zoneManager?: string }) => {
  const name = vendor?.name || getId();
  const notes = "notes";
  let contact = await fillContactCard(page, "", true);
  let billingContact = await fillContactCard(page, "", true);

  await openVendorsTable(page);
  await searchTable(page, name);
  if (await getRowCount(page)) return { name, notes, contact, billingContact };

  await openCreatePage(page);
  if (vendor.zoneManager) await selectOption(page, "#zoneManagerId", vendor.zoneManager);
  await page.click("#addContact");
  contact = await fillContactCard(page, "#contacts-0");
  billingContact = await fillContactCard(page, "#billingContact");
  await page.fill("#name", name);
  await page.click("#search");
  await page.fill("#email", String(process.env.EMAIL));
  await page.fill("#notes", notes);
  await page.click("#dialog #search");
  await page.click("#organization-0");

  await saveForm(page);
  return { name, notes, contact, billingContact };
};

export const openVendorsTable = async (page: Page) => {
  await page.goto("/vendor");
  await page.waitForURL("**/vendor", { timeout: 30 * 1000 });
  await resetTable(page);
};

export const vendorTimeout = 1.5 * 60000;
