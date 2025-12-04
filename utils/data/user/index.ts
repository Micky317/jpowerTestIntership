import { expect, Page } from "@playwright/test";
import { deleteForm, getId, saveForm } from "@/utils";
import { selectAddress } from "@/utils/input";
import {
  getCellSelector,
  getRowCount,
  openCreatePage,
  openFirstRow,
  resetTable,
  searchTable,
} from "@/utils/table";

export * from "./utils";

type Role = "Account Manager" | "Service Delivery Manager" | "Zone Manager";

export const addRoleToUser = async (page: Page, role: Role) => {
  const initialUrl = page.url();
  await openUsersTable(page);
  await resetTable(page);
  await searchTable(page, String(process.env.EMAIL));

  const roles = (await page.locator(getCellSelector(2, 2)).textContent()) || "";
  if (roles.includes(role)) {
    const firstName = await page.locator(getCellSelector(2, 0)).textContent();
    const lastName = await page.locator(getCellSelector(2, 1)).textContent();
    await page.goto(initialUrl);
    await page.waitForURL(initialUrl);
    return `${firstName} ${lastName}`;
  }

  await openFirstRow(page);
  const id = `#is${role.replace(/ /g, "")}`;
  const hasRole = await page.locator(`${id}[data-value='true']`).isVisible();
  if (!hasRole) await page.click(id);

  const firstName = await page.inputValue("#firstName");
  const lastName = await page.inputValue("#lastName");
  const name = `${firstName} ${lastName}`;
  await saveForm(page);
  await page.goto(initialUrl);
  await page.waitForURL(initialUrl);
  return name;
};

export const createUser = async (page: Page, user: { name: string; role?: string }) => {
  const firstName = user.name;
  const lastName = user.name;
  const role = user.role || "Account Manager";
  const email = `${getId()}@email.com`.toLowerCase();
  const phone = "(123) 456-7890";
  const title = "Manager";
  const notes = "notes";
  let address = "1106 Madison St, Oakland, CA 94607";

  await openUsersTable(page);
  await searchTable(page, user.name);
  if (await getRowCount(page))
    return {
      firstName,
      lastName,
      email: (await page.locator(getCellSelector(2, 3)).textContent()) || "",
      phone,
      role,
      title,
      notes,
      address,
    };

  await openCreatePage(page);
  address = await selectAddress(page, "#address");
  await page.fill("#firstName", firstName);
  await page.fill("#lastName", lastName);
  await page.fill("#email", email);
  await page.fill("#phone", phone);
  await page.fill("#title", title);
  await page.fill("#notes", notes);
  await page.fill("#password", String(process.env.PASSWORD));
  await page.click(`#is${role.replace(/ /g, "")}`);
  await saveForm(page);
  return { address, firstName, lastName, email, phone, role, title, notes };
};

export const deleteUser = async (page: Page, name: string) => {
  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
};

export const openUsersTable = async (page: Page) => {
  await page.goto("/user/new");
};

export const validateContact = async (page: Page, id: string) => {
  await expect(page.locator(`#${id}-firstName`)).toHaveValue("Edited");
  await expect(page.locator(`#${id}-lastName`)).toHaveValue("Edited");
  await expect(page.locator(`#${id}-email`)).toHaveValue("edited@email.com");
  await expect(page.locator(`#${id}-phone`)).toHaveValue("(222) 222-2222");
  await expect(page.locator(`#${id}-secondaryPhone`)).toHaveValue("(111) 111-1111");
};
