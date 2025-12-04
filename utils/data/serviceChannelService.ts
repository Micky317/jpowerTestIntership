import { Page } from "@playwright/test";
import { saveForm } from "..";
import { selectOption } from "../input";
import { getRowCount, openCreatePage, searchTable } from "../table";

export const createServiceChannelService = async (
  page: Page,
  serviceChannelService: {
    client: string;
    service: string;
    problemCode: string;
    description: string;
  },
) => {
  await openServiceChannelServicesTable(page);
  await searchTable(page, `${serviceChannelService.client}, ${serviceChannelService.client}`);
  if (await getRowCount(page)) return;

  await openCreatePage(page);
  await selectOption(page, "#clientId", serviceChannelService.client);
  await selectOption(page, "#serviceId", serviceChannelService.service);
  await page.fill("#problemCode", serviceChannelService.problemCode);
  await page.fill("#description", serviceChannelService.description);
  await saveForm(page);
};

export const openServiceChannelServicesTable = async (page: Page) => {
  if (!(await page.isVisible("#serviceChannelServices"))) await page.click("#settings");
  await page.click("#serviceChannelServices");
  await page.waitForURL("**/service-channel-service");
};
