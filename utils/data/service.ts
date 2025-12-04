import { Page } from "@playwright/test";
import { saveForm } from "..";
import { selectOption } from "../input";
import { getRowCount, openCreatePage, searchTable } from "../table";

export const createService = async (page: Page, service: { name: string; order?: string }) => {
  await openServicesTable(page);
  await searchTable(page, service.name);
  if (await getRowCount(page)) return;

  await openCreatePage(page);
  await page.fill("#name", service.name);
  if (service.order) await page.fill("#order", service.order);
  if (await page.isVisible("#quickBooksAccount-id"))
    await selectOption(page, "#quickBooksAccount-id");
  if (await page.isVisible("#quickBooksItem-id")) await selectOption(page, "#quickBooksItem-id");
  await saveForm(page);
};

export const openServicesTable = async (page: Page) => {
  if (!(await page.isVisible("#services"))) await page.click("#settings");
  await page.click("#services");
  await page.waitForURL("**/service", { timeout: 30 * 1000 });
};

export const serviceTimeout = 2 * 60000;
