import { Page } from "@playwright/test";
import dayjs from "dayjs";
import { saveForm } from "..";
import { selectOption } from "../input";
import { openFirstRow, searchTable } from "../table";
import { createEvent } from "./event";

export const createInvoice = async (page: Page, invoice: { name: string }) => {
  await createEvent(page, { name: invoice.name, createClient: true, createNew: true });
  await searchTable(page, invoice.name);
  await openFirstRow(page);

  await page.click("#addService, #open");
  await page.waitForURL("**/job/**", { timeout: 30 * 1000 });
  await page.check("#items-0-isComplete");
  await selectOption(page, "#status", "Complete");
  await page.fill("#serviceDate", dayjs().format("YYYY-MM-DD"));
  await selectOption(page, "#serviceDate-time");
  await saveForm(page);

  await page.click('a[data-status="Complete"] #open');
  await page.waitForSelector("#items-0-isComplete");
  await selectOption(page, "#status", "AM Approved");
  await saveForm(page);
};

export const openInvoicesTable = async (page: Page) => {
  if (!(await page.isVisible("#invoices"))) await page.click("#afterEvent");
  await page.click("#invoices");
  await page.waitForURL("**/invoice");
};
