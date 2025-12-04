import { Page } from '@playwright/test';

/**
 * Normalizes a number string by removing all non-numeric characters except dots and dashes
 */
export const normalizeNumberString = (value: string): string => {
    return value.replace(/[^\d.-]/g, '');
};

/**
 * Navigates to a tab and waits for it to be visible
 */
export const navigateToTab = async (page: Page, tabId: string) => {
    await page.waitForSelector(`#${tabId}`, { state: 'visible', timeout: 10000 });
    await page.click(`#${tabId}`);
    // Small wait for tab content to render
    await page.waitForTimeout(500);
};

/**
 * Waits for a specific number of rows to be present in the table
 */
export const waitForRowCount = async (page: Page, expectedCount: number, timeout = 7000) => {
    await page.waitForFunction(
        (count) => document.querySelectorAll('tr[id^="row-"]').length === count,
        expectedCount,
        { timeout }
    );
};

/**
 * Waits for a row to be added to the table
 */
export const waitForRowAdded = async (page: Page, previousCount: number) => {
    await waitForRowCount(page, previousCount + 1);
};

/**
 * Waits for a row to be removed from the table
 */
export const waitForRowRemoved = async (page: Page, previousCount: number) => {
    await waitForRowCount(page, previousCount - 1);
};

/**
 * Waits for save operation to complete by checking for network idle or specific selector
 */
export const waitForSaveComplete = async (page: Page) => {
    // Wait for any pending network requests to complete
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
        // If networkidle times out, that's okay, continue
    });
    await page.waitForTimeout(500);
};
