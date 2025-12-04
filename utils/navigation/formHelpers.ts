
import { Page } from '@playwright/test';


export async function selectDropdownOption(page: Page, triggerSelector: string, optionSelector: string) {
  await page.click(triggerSelector);
  const option = page.locator(optionSelector);
  await option.waitFor({ state: 'visible' });
  await option.scrollIntoViewIfNeeded();
  await option.click({ force: true });
}


