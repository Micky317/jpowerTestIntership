import { Page } from "@playwright/test";
import path from "path";
import { getId, saveForm } from "@/utils";
import { selectAddress } from "@/utils/input";
import { openFirstRow, searchTable } from "@/utils/table";

export const updateUser = async (page: Page, user: { name: string; role?: string }) => {
  await searchTable(page, user.name);
  await openFirstRow(page);

  await selectAddress(page, "#address");
  await page.fill("#address-line2", "line 3");
  await page.fill("#firstName", `Updated ${user.name}`);
  await page.fill("#lastName", `Updated ${user.name}`);
  await page.fill("#email", `updated${getId()}@email.com`.toLowerCase());
  await page.fill("#phone", "(222) 222-2222");
  await page.fill("#title", "updated title");
  await page.fill("#notes", "updated notes");

  const photoPath = path.join(__dirname, "../../../files/2.jpeg");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.click("#image");
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([photoPath]);

  await saveForm(page);
};
