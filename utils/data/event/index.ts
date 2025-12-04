import { Page } from "@playwright/test";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import * as path from "path";
import { saveForm } from "@/utils";
import { selectDateTime, selectOption } from "@/utils/input";
import { getRowCount, openCreatePage, openFirstRow, searchTable } from "@/utils/table";
import { createContract } from "../contract";

export * from "./utils";

export const createEvent = async (
  page: Page,
  event: {
    createClient?: boolean;
    createNew?: boolean;
    name: string;
    date?: Dayjs;
    addService?: boolean;
    windowEnd?: Dayjs;
    status?: string;
    addPhotos?: boolean;
  },
) => {
  const isPast = event.date?.isBefore(dayjs().startOf("day"));
  if (isPast) await openPostEventTable(page);
  else await openEventsTable(page);

  if (!event?.createNew && !event?.addPhotos) {
    await searchTable(page, event.name);
    if (await getRowCount(page)) return;
  }

  const { property } = await createContract(page, {
    createClient: event.createClient,
    name: event.name,
  });

  const date = event.date || dayjs();
  await openEventsTable(page);
  await openCreatePage(page);

  await selectOption(page, "#propertyId", property);
  await selectDateTime(page, "windowStart", date, 12);
  await selectDateTime(page, "windowEnd", date, 18);
  await saveForm(page);

  if (event.addPhotos) {
    await searchTable(page, event.name);
    await openFirstRow(page);
    await page.click("#addService, #open");
    await page.waitForURL("**/job/**");
    await page.click("#items-0-isComplete");

    for (const field of ["before", "after"])
      for (let i = 0; i < 3; i++) {
        const fileChooserPromise = page.waitForEvent("filechooser");
        await page.click(`#${field}Files`);
        const fileChooser = await fileChooserPromise;
        const filePath = path.join(__dirname, `../../../files/${i + 1}.jpeg`);
        await fileChooser.setFiles(filePath);
        await page.waitForTimeout(3000);
      }

    await saveForm(page);
    await openEventsTable(page);
  }

  if (event.addService) {
    if (isPast) await openPostEventTable(page);
    await searchTable(page, event.name);
    await openFirstRow(page);

    if (await page.isVisible("#open")) await page.click("#open");
    await page.waitForTimeout(1000);
    if (await page.isVisible("#addService")) await page.click("#addService");

    await page.waitForURL("**/job/**");
    if (event.status) await selectOption(page, "#status", event.status);

    await saveForm(page);
  }

  if (isPast) await openEventsTable(page);
  else await openEventsTable(page);
};

export const openEventsTable = async (page: Page) => {
  await 
  await page.goto("/event/new");
  await page.waitForURL("/event/new");
  await page.waitForSelector("#Search");
};

export const openPostEventTable = async (page: Page) => {
  await page.goto("/post-event");
  await page.waitForURL("/post-event");
  await page.waitForSelector("#Search");
};
