import { Page } from "@playwright/test";
import path from "path";
import { selectAddress, selectOption } from "@/utils/input";
import { getRowCount, openCreatePage, openFirstRow, searchTable } from "@/utils/table";
import { deleteForm, saveForm } from "..";
import { CreateClient, createClient } from "./client";
import { selectZone } from "./zone";

export const createProperty = async (
  page: Page,
  property: {
    client?: CreateClient;
    createClient?: boolean;
    name: string;
    serviceChannelLocationId?: string;
    zone?: number;
  },
) => {
  await openPropertiesTable(page);
  await searchTable(page, property.name);
  if (await getRowCount(page)) return;

  await openCreatePage(page);
  if (property.createClient || property.client) {
    await createClient(page, { ...(property.client || {}), name: property.name });
    await openPropertiesTable(page);
    await openCreatePage(page);
    await selectOption(page, "#clientId", property.name);
  }

  await page.waitForTimeout(2000);
  await page.fill("#address", "");
  await page.waitForTimeout(1000);
  await selectAddress(page, "#address", Math.random().toString());
  await page.fill("#name", property.name);
  await page.fill("#shortId", property.name);
  if (property.serviceChannelLocationId)
    await page.fill("#serviceChannelLocationId", property.serviceChannelLocationId);
  await page.fill("#notes", "test");
  if (property.zone) await selectOption(page, "#zoneId", `Zone ${property.zone}`);

  const filePath = path.join(__dirname, "../../files/1.jpeg");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.click("#maps");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([filePath]);

  await page.waitForTimeout(1000);

  await page.click("#save");
  await page.waitForTimeout(500);
  await page.waitForURL("**/property");
};

export const deleteProperty = async (page: Page, name: string) => {
  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
};

export const openPropertiesTable = async (page: Page) => {
  await page.goto("/property");
  await page.waitForURL("**/property", { timeout: 30 * 1000 });
};

export const propertyTimeout = 1.5 * 60000;

export async function updateProperty(page: Page, name: string) {
  await searchTable(page, name);
  await openFirstRow(page);

  await page.fill("#name", "Edited " + name);
  await page.fill("#shortId", "Edited " + name);
  await page.fill("#notes", "Edited test");

  await saveForm(page);
}

export const fillMapProperty = async (page: Page, id: string, mapperName?: string) => {
  const parkingLot = "5000";
  const sidewalks = "1500";
  const turf = "12000";
  const trimming = "3000";
  const bed = "2500";
  const edging = "800";
  const shrubs = "450";

  await page.fill(`${id}-parkingLot`, parkingLot);
  await page.fill(`${id}-sidewalks`, sidewalks);
  await page.fill(`${id}-turf`, turf);
  await page.fill(`${id}-trimming`, trimming);
  await page.fill(`${id}-bed`, bed);
  await page.fill(`${id}-edging`, edging);
  await page.fill(`${id}-shrubs`, shrubs);
  await selectZone(page, '#mapperUserId', 40); 

  return { parkingLot, sidewalks, turf, trimming, bed, edging, shrubs };
  };

export const fillSalesProperty = async (page : Page, id: string ) => {
  await selectZone(page, `${id}-quality`, 50);
  await selectZone(page, `${id}-frequency`, 40);
  await selectZone(page, `${id}-mulching`, 40);
  await selectZone(page, `${id}-fertilization`, 40);
  await selectZone(page, `${id}-typeOfMulch`, 40);
  
}
