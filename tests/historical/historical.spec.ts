import { expect, Page, test } from "@playwright/test";
import dayjs from "dayjs";
import { signIn } from "@/utils";
import { createEvent, openHistoricalPage, updateEvent } from "@/utils/data/event";
import { getCellSelector, openFirstRow, searchTable } from "@/utils/table";

const date = dayjs().subtract(1, "day");
const month = date.format("M");
const day = date.format("D");

test.beforeEach(async ({ page }) => {
  test.setTimeout(3 * 60000);
  await signIn(page);
});

test("Historical page lists a rejected past event", async ({ page }) => {
  const name = "Historical 1";
  await beforeEach(page, name);

  await expect(page.locator(getCellSelector(2, 0))).toHaveText(name + ".");
});

test("Historical page lists a VP Approved, Accounting Reviewed, Bill Created, Bill Paid, Rejected past event", async ({
  page,
}) => {
  const name = "Historical 2";
  await beforeEach(page, name);

  await changeEventStatus(page, name, "VP Approved");
  await changeEventStatus(page, name, "Accounting Reviewed");
  await changeEventStatus(page, name, "Bill Created");
  await changeEventStatus(page, name, "Bill Paid");
});

const beforeEach = async (page: Page, name: string) => {
  await createEvent(page, { createNew: true, name, date, addService: true, status: "Rejected" });
  await openHistoricalPage(page);
  await page.click(`#month-${month}-open`);
  await page.click(`#day-${day}-open`);
  await searchTable(page, name);
};

const changeEventStatus = async (page: Page, name: string, statusName: string) => {
  await openFirstRow(page);
  await updateEvent(page, { status: statusName });
  await openHistoricalPage(page);
  await page.click(`#month-${month}-open`);
  await page.click(`#day-${day}-open`);
  await searchTable(page, name);
  await expect(page.locator(getCellSelector(2, 0))).toHaveText(name + ".");
};
