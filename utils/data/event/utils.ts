import { Page } from "@playwright/test";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { saveForm } from "@/utils";
import { selectDateTime, selectOption } from "@/utils/input";

export const openHistoricalPage = async (page: Page) => {
  await page.goto("/historical");
  await page.waitForURL("/historical");
};

export const updateEvent = async (
  page: Page,
  event: { status?: string; date?: Dayjs; windowEnd?: string },
) => {
  if (event.status) {
    await page.waitForURL("/job/**");
    await page.waitForSelector("#items-0-isComplete");
    await selectOption(page, "#status", event.status);
    if (event.status === "Complete") await selectDateTime(page, "serviceDate", dayjs(), 18);
    await saveForm(page);
  }

  if (event.date) {
    await page.waitForSelector("#breadcrumb-2");
    await page.click("#breadcrumb-1");
    await page.waitForURL("/event/**");
    await page.waitForSelector("#items-0-isComplete");
    await selectDateTime(page, "windowStart", event.date, 12);
    await selectDateTime(page, "windowEnd", event.date, 18);
    await saveForm(page);
  }
};
