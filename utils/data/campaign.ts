import { Page } from "@playwright/test";
import { saveForm } from "..";
import { selectOption } from "../input";
import { getRowCount, openCreatePage, openFirstRow, searchTable } from "../table";

export const campaignTimeout = 1.5 * 60000;

export const createCampaign = async (
  page: Page,
  campaign: { createNew?: boolean; name: string; zone?: number },
) => {
  if (!campaign.createNew) {
    await openCampaignsTable(page);
    await searchTable(page, campaign.name);
    if (await getRowCount(page)) {
      await openFirstRow(page);
      await page.check("#isActive");
      await saveForm(page);
      return;
    }
  }

  await openCreatePage(page);
  await page.fill("#name", campaign.name);

  if (campaign.zone) {
    await page.check("#isActive");
    await page.click(`#addRoute-${campaign.zone}`);
    let index = 0;
    while (index === 0 || (await page.isVisible(`#zone-${campaign.zone}-noRoute-${index}`))) {
      await page
        .locator(`#zone-${campaign.zone}-noRoute-${index}`)
        .dragTo(page.locator(`#zone-${campaign.zone}-route-0`));
      index++;
    }
    await selectOption(page, "#vendor", `${campaign.name} Vendor`);
  }

  await saveForm(page);
};

export const openCampaignsTable = async (page: Page) => {
  if (!(await page.isVisible("#snowCampaigns"))) await page.click("#settings");
  await page.click("#snowCampaigns");
  await page.waitForURL("**/campaign");
};
