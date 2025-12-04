import { Page } from "@playwright/test";
import { saveForm } from "@/utils";
import { getRowCount, openCreatePage, searchTable } from "@/utils/table";
import { selectOption } from "../input";

export const createZone = async (
  page: Page,
  zone?: { zoneManager?: string; number?: number; zipCodes?: string },
) => {
  const number = zone?.number || Number(Math.random().toString().slice(2, 6));

  await openZonesTable(page);
  await searchTable(page, `Zone ${number}`);
  if (await getRowCount(page)) return number;

  await openCreatePage(page);
  await page.fill("#number", number.toString());
  if (zone?.zoneManager) await selectOption(page, "#zoneManagerId", zone.zoneManager);
  if (zone?.zipCodes) await page.fill("#zipCodes", zone.zipCodes);
  await saveForm(page);

  return number;
};

export const openZonesTable = async (page: Page) => {
  if (!(await page.isVisible("#zones"))) await page.click("#settings");
  if (await page.isVisible("#zones")) await page.click("#zones");
  await page.waitForURL("**/zone", { timeout: 20 * 1000 });
};

export const selectZone = async (page: Page, zoneId: string, offsetY: number = 40) => {
  await page.click(zoneId);
  const box = await page.locator(zoneId).boundingBox();
  if (!box) throw new Error('Zone input not found');
  await page.waitForTimeout(500);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height + offsetY);
};