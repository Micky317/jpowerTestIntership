import { expect, Page } from "@playwright/test";
import fs from "fs";
import _ from "lodash";
import path from "path";
import { getId } from "..";
import { getCellSelector, getRowCount, scrollTableLeft, scrollTableRight } from "./utils";

export * from "./utils";

export const editTableColumns = async (
  page: Page,
  addColumns: string[],
  removeColumns?: string[],
) => {
  await page.waitForSelector("#search");
  await resetTable(page);
  await scrollTableRight(page);
  await page.click("#editColumns");

  for (const column of addColumns) {
    const id = "#" + _.camelCase(column);
    if (await page.locator(`${id}[data-value="false"]`).isVisible()) await page.click(id);
  }
  for (const column of removeColumns || []) {
    const id = "#" + _.camelCase(column);
    if (await page.locator(`${id}[data-value="true"]`).isVisible()) await page.click(id);
  }

  await page.click("#close");
  await scrollTableRight(page);
  for (const addColumn of addColumns)
    await page.waitForSelector(`#${_.camelCase(addColumn)}-header`);

  await page.waitForTimeout(1000);
};

export const resetTable = async (page: Page) => {
  const canReset = await page.locator("#reset").isVisible();
  if (canReset) await page.click("#reset");
  await scrollTableLeft(page);
};

export const sortColumn = async (
  page: Page,
  column: string,
  direction: "ascending" | "descending",
) => {
  await scrollTableRight(page);
  const id = "#" + _.camelCase(column);
  await page.hover(`${id}-header`);
  await Promise.any([
    expect(page.locator(`${id}-ascending`))
      .toBeVisible()
      .catch(() => {}),
    expect(page.locator(`${id}-descending`))
      .toBeVisible()
      .catch(() => {}),
  ]);
  if (!(await page.isVisible(`${id}-${direction}`))) {
    await page.hover(`${id}-header`);
    await page.click(`${id}-${direction === "ascending" ? "descending" : "ascending"}`);
  }
  await page.click(`${id}-${direction}`);
};

export const searchTable = async (page: Page, text: string) => {
  await page.waitForTimeout(1000);
  await page.fill("#search", text);
  await page.waitForTimeout(3000);
};

export const testImport = async (page: Page, fileName: string) => {
  let text = fs.readFileSync(path.join(__dirname, `../../files/${fileName}`), "utf8");
  const id = getId();
  text = text.replace(/replace/g, id);

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.click("#export-menu-toggle");
  await page.click("#import");
  await page.waitForSelector('#uploadCsv', { state: "visible", timeout: 5000 });
  await page.click("#uploadCsv");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([
    { name: fileName, mimeType: "text/csv", buffer: Buffer.from(text, "utf8") },
  ]);

  await page.waitForTimeout(10000);
  await searchTable(page, id);
  await expect(await getRowCount(page)).toBe(1);
};

export const testColumnReposition = async (page: Page) => {
  const first = getCellSelector(0, 0);
  const second = getCellSelector(0, 1);
  const firstText = (await page.locator(first).textContent()) || "";
  const secondText = (await page.locator(second).textContent()) || "";
  await page.locator(first).dragTo(page.locator(second));
  await expect(await page.locator(first)).toHaveText(secondText);
  await expect(await page.locator(second)).toHaveText(firstText);
  await resetTable(page);
};
