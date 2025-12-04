import { Page } from "@playwright/test";
import { waitForPageChange } from "..";

export const getCellSelector = (row: number, column: number) =>
  `[data-row="${row}"][data-column="${column}"]`;

export const getColumnCount = async (page: Page) =>
  Number(await page.getAttribute("[data-column-count]", "data-column-count"));

export const getRowCount = async (page: Page) => {
  const rowCount = await page.locator("#rowCount").textContent();
  return Number(rowCount);
};

export const openCreatePage = async (page: Page) => {
  await page.click("#new");
  await waitForPageChange(page);
};

export const openFirstRow = async (page: Page) => {
  await scrollTableLeft(page);
  await page.click(getCellSelector(2, 1));
  await waitForPageChange(page);
};

export const scrollTableLeft = async (page: Page) => {
  page.evaluate(() => {
    const grid = document.getElementsByClassName("ReactVirtualized__Grid")[1];
    if (grid) grid.scrollLeft = 0;
  });
  await page.waitForTimeout(1000);
};

export const scrollTableRight = async (page: Page) => {
  page.evaluate(() => {
    const grid = document.getElementsByClassName("ReactVirtualized__Grid")[1];
    if (grid) grid.scrollLeft = 9999;
  });
  await page.waitForTimeout(100);
  page.evaluate(() => {
    const grid = document.getElementsByClassName("ReactVirtualized__Grid")[1];
    if (grid) grid.scrollLeft = 9999;
  });
};
