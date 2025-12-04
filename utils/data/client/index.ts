import { Page } from "@playwright/test";
import path from "path";
import { selectOption } from "@/utils/input";
import { getRowCount, openCreatePage, openFirstRow, searchTable } from "@/utils/table";
import { deleteForm, saveForm } from "../..";
import { fillContactCard } from "../../contact";
import { CreateClient } from "./utils";

export * from "./utils";

export const clientTimeout = 2 * 60000;

export const createClient = async (page: Page, client: CreateClient) => {
  const name = client.name;
  const shortId = client.name;
  const accountManager = client.accountManager;
  const notes = "notes";
  const priority = "High";
  const contact = await fillContactCard(page, "", true);
  const billingContact = await fillContactCard(page, "billingContact", true);

  await openClientsTable(page);
  await searchTable(page, client.name);
  if (await getRowCount(page))
    return { name, shortId, accountManager, contact, billingContact, notes, priority };

  await openCreatePage(page);

  await page.fill("#name", client.name);
  await page.fill("#shortId", client.name);
  if (accountManager) await selectOption(page, "#accountManagerId", accountManager);
  await page.fill("#notes", notes);
  await selectOption(page, "#priority", priority);

  await page.click("#addContact");
  await fillContactCard(page, "#contacts-0");
  await fillContactCard(page, "#billingContact");

  const photoPath = path.join(__dirname, "../../../files/1.jpeg");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.click(".bg-slate-200.w-24.h-24.rounded-full.cursor-pointer");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([photoPath]);

  if (client.serviceChannel) {
    await page.fill("#serviceChannel-category", client.serviceChannel.category);
    await page.fill("#serviceChannel-priority", client.serviceChannel.priority);
    await page.fill("#serviceChannel-statusPrimary", client.serviceChannel.statusPrimary);
    await page.fill("#serviceChannel-statusExtended", client.serviceChannel.statusExtended);
    await page.fill("#serviceChannel-subscriberId", client.serviceChannel.subscriberId);
    await page.fill("#serviceChannel-tradeName", client.serviceChannel.tradeName);
  }

  await saveForm(page);
  return { name, shortId, accountManager, contact, billingContact, notes, priority };
};

export const deleteClient = async (page: Page, name: string) => {
  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
};

export const openClientsTable = async (page: Page) => {
  await page.goto("/client/new");
  await page.waitForURL("**/client/new");
};

export const updateClient = async (
  page: Page,
  client: { name: string; accountManager?: string },
) => {
  await openClientsTable(page);
  await searchTable(page, client.name);
  await openFirstRow(page);

  await page.fill("#name", "Edited " + client.name);
  await page.fill("#shortId", "Edited " + client.name);
  if (client.accountManager) await selectOption(page, "#accountManagerId", client.accountManager);
  await selectOption(page, "#priority", "Medium");

  await page.fill(`#billingContact-firstName`, "Edited");
  await page.fill(`#billingContact-lastName`, "Edited");
  await page.fill(`#billingContact-email`, "edited@email.com");
  await page.fill(`#billingContact-phone`, "(222) 222-2222");
  await page.fill(`#billingContact-secondaryPhone`, "(111) 111-1111");

  await page.fill(`#contacts-0-firstName`, "Edited");
  await page.fill(`#contacts-0-lastName`, "Edited");
  await page.fill(`#contacts-0-email`, "edited@email.com");
  await page.fill(`#contacts-0-phone`, "(222) 222-2222");
  await page.fill(`#contacts-0-secondaryPhone`, "(111) 111-1111");

  const photoPath = path.join(__dirname, "../../../files/2.jpeg");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.click(".bg-slate-200.w-24.h-24.rounded-full.cursor-pointer");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([photoPath]);

  await saveForm(page);
};
