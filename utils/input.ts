import { expect, Page } from "@playwright/test";
import { Dayjs } from "dayjs";
import fs from "fs";
import path from "path";
import { saveForm } from ".";
import { openFirstRow, searchTable } from "./table";
import { uploadFile } from ".";

export const selectAddress = async (page: Page, id: string, line2?: string) => {
  const partialAddress = "1106 Madison St, Oakland, CA";
  const address = `${partialAddress} 94607`;
  await page.dblclick(id);
  await page.locator(id).pressSequentially(partialAddress.slice(0, -6), { delay: 100 });
  const box = await page.locator(id).boundingBox();
  if (!box) throw new Error();
  await page.waitForTimeout(1000);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height + 10);
  await expect(page.locator(id)).toHaveValue(address);
  if (line2) await page.fill(`${id}-line2`, line2);
  return address;
};

/*export const selectDateTime = async (page: Page, id: string, date: Dayjs, hour: number) => {
  await page.fill(`#${id}`, date.format("YYYY-MM-DD"));
  await selectOption(page, `#${id}-time`, date.hour(hour).startOf("h").format("h:mm A"));
};*/

export const selectOption = async (page: Page, id: string, text?: string | string[]) => {
  await page.click(id).catch(() => {
    throw new Error(`Could not find element with id: ${id}`);
  });
  let locator;
  if (text) {
    const array = Array.isArray(text) ? text : [text];
    await page.fill(id, array[0]);
    locator = await page.locator(array.map((text) => `[data-text="${text}"]`).join(", "));
  } else locator = await page.getByTestId(`${id.slice(1)}-0`);

  const optionText = await locator.first().textContent();
  await locator.first().click();
  return optionText;
};

export const testDownload = async (page: Page, name: string) => {
  const filePath = path.join(__dirname, "../files/TestFile.pdf");
  const fileContent = fs.readFileSync(filePath, "utf8");
  await page.waitForSelector("#addFile");
  await page.waitForTimeout(1000);

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.click("#addFile");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([
    {
      name: "TestFile.pdf",
      mimeType: "text/pdf",
      buffer: Buffer.from(fileContent, "utf8"),
    },
  ]);

  await page.waitForTimeout(1000);
  await page.waitForSelector("#files-0-download");
  await page.click("#files-0-download");
  await saveForm(page);
  await searchTable(page, name);

  await openFirstRow(page);
  await page.waitForSelector("#files-0-download");
  await page.click("#files-0-download");
  await Promise.any([page.waitForEvent("download"), page.context().waitForEvent("page")]);

  await page.waitForTimeout(1000);
  await saveForm(page);
};

export const toggleCheckbox = async (page: Page, id: string) => {
  const value = await page.locator(id).getAttribute("data-value");
  await page.click(`${id}[data-value="${value}"]`);
  await page.click(`${id}[data-value="${value === "true" ? "false" : "true"}"]`);
  await expect(page.locator(`${id}[data-value="${value}"]`)).toBeVisible();
};

export const notesAndFiles = async (page: Page, notes?: string) => {
  const notesText = notes || "lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
  
  await page.locator(`.ql-editor`).evaluate((el, text) => {
    el.innerHTML = `<p>${text}</p>`;
  }, notesText);
  
  await uploadFile(page, `#addFile`);
}
export const fillDate = async (page: Page, fieldId: string, date = new Date()) => {
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const dateString = `${year}-${month}-${day}`;
  
  await page.fill(fieldId, dateString);
};

export const storeFields = async (
  page: Page,
  fieldIds: string[]
): Promise<Record<string, string>> => {
  const values: Record<string, string> = {};
  for (const id of fieldIds) {
    values[id] = await page.inputValue(`#${id}`);
  }
  return values;
};

export const restoreFields = async (
  page: Page,
  values: Record<string, string>
): Promise<void> => {
  for (const [id, value] of Object.entries(values)) {
    await page.fill(`#${id}`, value);
  }
  await page.click('#save');
  await page.waitForTimeout(2000);
};

