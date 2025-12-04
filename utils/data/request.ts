import { Page } from "@playwright/test";
import { deleteForm, saveForm } from "..";
import { selectOption } from "../input";
import { getRowCount, openCreatePage, openFirstRow, searchTable } from "../table";
import { createProperty } from "./property";

export const createRequest = async (page: Page, request: { name: string; reason?: string }) => {
  await createProperty(page, { name: request.name });
  await openRequestsTable(page);
  await searchTable(page, request.name);
  if (await getRowCount(page)) return;

  await openCreatePage(page);
  await page.fill("#name", request.name);
  await selectOption(page, "#propertyId", request.name);
  await selectOption(page, "#reason", request.reason);
  await saveForm(page);
};

export const deleteRequest = async (page: Page, name: string) => {
  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
};

export const openRequestsTable = async (page: Page) => {
  await page.goto("/request");
};

export const requestTimeout = 2 * 60000;
