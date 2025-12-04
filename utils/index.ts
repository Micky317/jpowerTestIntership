import { expect, Frame, Page } from "@playwright/test";
import dayjs from "dayjs";
import fs from "fs";
import path from "path";
import { v4 } from "uuid";

export const DATE_REGEX = /[A-Z][a-z]{2} \d{1,2}, \d{1,2}:\d{2} (AM|PM)/;
export const ID_REGEX = /[A-Z0-9]{5}/;

export const deleteForm = async (page: Page) => {
  await page.click("#delete");
  await page.click("#confirmDelete");
  return waitForPageChange(page);
};

export const getId = (length?: number) => v4().replace(/[-:.]/g, "").slice(0, length);

export const getMyName = async (page: Page) => {
  const initialUrl = page.url();
  await page.click('img[alt="image"]');
  await page.click("#settings");
  await page.waitForURL("**/setting");
  const firstName = await page.locator("#firstName").inputValue();
  const lastName = await page.locator("#lastName").inputValue();
  page.goto(initialUrl);
  await page.waitForURL(initialUrl);
  return `${firstName} ${lastName}`;
};

export const saveForm = async (page: Page, options?: { awaitRedirect?: boolean }) => {
  await page.waitForTimeout(1000);
  await page.click("#save");
  if (options?.awaitRedirect === false) return;
  await waitForPageChange(page);
};

export const signIn = async (page: Page) => {
  await page.setViewportSize({ width: 1500, height: 700 });
  await page.goto(String(process.env.BASE_URL));
  await page.fill("#email", String(process.env.EMAIL));
  await page.fill("#password", String(process.env.PASSWORD));
  await page.click("#submit");
  await page.waitForURL("/sales");
};

export const uploadFile = async (page: Page, id: string) => {
  const text = fs.readFileSync(path.join(__dirname, "../files/Fe-Teleferico.png"), "utf8");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.click(id);
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([
    {
      name: "Fe-Teleferico.png",
      mimeType: "image/png",
      buffer: Buffer.from(text, "utf8"),
    },
  ]);
  return "Fe-Teleferico.png";
};

export const validateUpdateTime = async (time: string) => {
  const now = dayjs().format("MMM D, h:mm A");
  const lastMinute = dayjs().subtract(1, "minute").format("MMM D, h:mm A");
  await expect([now, lastMinute]).toContain(time);
};

export const waitForPageChange = (page: Page) =>
  new Promise((resolve) => {
    const listener = (frame: Frame) => {
      if (frame === page.mainFrame()) {
        page.off("framenavigated", listener);
        resolve(undefined);
      }
    };
    page.on("framenavigated", listener);
  });
