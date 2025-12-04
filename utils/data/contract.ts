import { expect, Page } from "@playwright/test";
import { getId, saveForm } from "@/utils";
import { createService } from "@/utils/data/service";
import { selectOption } from "@/utils/input";
import { getRowCount, openCreatePage, openFirstRow, searchTable } from "@/utils/table";
import { CreateClient } from "./client";
import { createProperty } from "./property";

export const createContract = async (
  page: Page,
  contract: {
    property?: { serviceChannelLocationId: string };
    client?: CreateClient;
    createClient?: boolean;
    createNew?: boolean;
    name: string;
    zone?: number;
  },
) => {
  const contractName = contract.name + (contract.createNew ? getId() : ".");
  const propertyName = contract.name + ".";

  if (!contract.createNew) {
    await openContractsTable(page);
    await searchTable(page, contractName);
    if (await getRowCount(page)) return { property: propertyName };
  }

  await createProperty(page, {
    serviceChannelLocationId: contract.property?.serviceChannelLocationId,
    client: contract.client,
    createClient: contract.createClient,
    name: propertyName,
    zone: contract.zone,
  });
  await createService(page, { name: contract.name });
  await openContractsTable(page);
  await openCreatePage(page);

  await page.fill("#name", contractName);
  await page.fill("#shortId", contractName);
  await selectOption(page, "#propertyId", [propertyName, `${propertyName} (${propertyName})`]);
  await page.fill("#startDate", "2020-01-01");
  await page.fill("#endDate", "2020-12-31");
  await selectOption(page, "#type");

  const hasFirstItem = await page.locator("#items-0-serviceId").isVisible();
  if (!hasFirstItem) await page.click("#addItem");
  await selectOption(page, "#items-0-serviceId", contract.name);
  await selectOption(page, "#items-0-unit");
  await page.fill("#items-0-price", "100");

  if (await page.locator("#markNeedsReview").isVisible()) await page.click("#markNeedsReview");
  await page.click("#markReviewed");

  await openVendorContract(page);
  if (await page.locator("#markNeedsReview").isVisible()) await page.click("#markNeedsReview");
  await page.click("#markReviewed");
  await saveForm(page);
  return { property: propertyName };
};

const deletePartyContract = async (page: Page) => {
  await page.waitForSelector("#name");
  await page.click("#delete");
  await page.click("#confirmDelete");
  await Promise.any([
    new Promise((resolve) => {
      const checkError = async () =>
        expect(await page.textContent("#deleteError")).toContain("Contract is linked to events");
      checkError()
        .then(resolve)
        .catch(() => {});
    }),
    new Promise((resolve) => {
      page
        .waitForURL("**/contract")
        .then(resolve)
        .catch(() => {});
    }),
  ]);
};

export const deleteContract = async (page: Page, name: string) => {
  await searchTable(page, name);
  await openFirstRow(page);
  await deletePartyContract(page);

  await openFirstRow(page);
  await openVendorContract(page);
  await deletePartyContract(page);
};

export const openContractsTable = async (page: Page) => {
  await page.click("#contracts");
  await page.waitForURL("**/contract");
};

export const openVendorContract = async (page: Page) => {
  await page.waitForSelector("#name");
  await page.click("#Vendor");
  if (await page.locator("#dialog #save").isVisible()) await page.click("#dialog #save");
  else await expect(page.locator("#name")).not.toBeVisible();
  await page.waitForSelector("#name");
};
