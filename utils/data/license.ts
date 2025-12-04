import { Page } from "@playwright/test";
import { saveForm } from "..";
import { selectOption } from "../input";
import { getRowCount, openCreatePage, searchTable } from "../table";
import { createUser } from "./user";

export const createLicense = async (
  page: Page,
  license: { createNew?: boolean; type?: "Basic" | "Standard" | "Premium"; name: string },
) => {
  if (!license.createNew) {
    await openLicensesTable(page);
    await searchTable(page, license.name);
    if (await getRowCount(page)) return;
  }

  await createUser(page, { name: license.name });

  await openLicensesTable(page);
  await openCreatePage(page);
  await selectOption(page, "#type", license.type);
  await selectOption(page, "#user", `${license.name} ${license.name}`);
  await saveForm(page);
};

export const licenseTimeout = 3 * 60000;

export const openLicensesTable = async (page: Page) => {
  if (!(await page.isVisible("#licenses"))) await page.click("#settings");
  await page.click("#licenses");
  await page.waitForURL("**/license");
};
