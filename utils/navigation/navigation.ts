
import { Page } from '@playwright/test';

export async function openEstimateForClient(
  page: Page,
  clientName: string,
  estimateName?: string
) {
  await page.waitForTimeout(7000);
  await page.click('#clientsSales');
  await page.waitForTimeout(5000);
  await page.click('#clients');
  await page.getByText(clientName, { exact: true }).click();
  await page.waitForTimeout(5000);
  await page.click('#Estimates');
  await page.waitForTimeout(5000);

  if (estimateName) {
    await page.locator('div.group').getByText(estimateName, { exact: true }).click();
  } else {
    const firstEstimate = page.locator('a[href*="/estimate/"]').first();
    await firstEstimate.waitFor({ state: 'visible', timeout: 10000 });
    await firstEstimate.click();
  }
}


export async function openEstimateWorkOrderForClient(page: Page, clientName: string, estimateName?: string) {
  await page.waitForTimeout(7000);
  await page.click('#clientsSales');
  await page.waitForTimeout(5000);
  await page.click('#clients');
  await page.getByText(clientName, { exact: true }).click();
  await page.waitForTimeout(5000);
  await page.click('#Estimates');
  await page.waitForTimeout(5000);

  if (estimateName) {
    await page.getByText(estimateName, { exact: true }).click();
  } else {
    // Click the first Work Order estimate
    const firstWorkOrder = page.locator('a[href*="/estimate/"]:has-text("Work Order")').first();
    if (await firstWorkOrder.count() > 0) {
      await firstWorkOrder.click();
    } else {
      // Fallback: click any estimate
      const firstEstimate = page.locator('a[href*="/estimate/"]').first();
      await firstEstimate.click();
    }
  }
}

export async function openEstimateOfTheClient(page: Page, clientName: string, estimateName?: string) {
  await page.waitForTimeout(7000);
  await page.click('#clientsSales');
  await page.waitForTimeout(5000);
  await page.click('#clients');
  await page.getByText(clientName, { exact: true }).click();
  await page.waitForTimeout(5000);
}
export async function openPropertiesInTheClients(page: Page, clientName: string, estimateName?: string) {
  await page.waitForTimeout(7000);
  await page.click('#clientSales');
  await page.waitForTimeout(5000);
  await page.click('#clients');
  await page.getByText(clientName, { exact: true }).click();
  await page.waitForTimeout(5000);
  await page.click('#properties');
  await page.waitForTimeout(5000);
}
export async function openProperties(page: Page) {
  await page.click('#clientSales');
  await page.waitForTimeout(5000);
  await page.click('#properties');
  await page.waitForTimeout(5000);
}
export async function changeLead(page: Page) {
  await page.click('#status');
  await page.waitForTimeout(1000);
  await page.click('#status-Lead');
  await page.waitForTimeout(1000);
}
