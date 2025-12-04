import { expect, test } from "@playwright/test";
import { getId, saveForm, signIn } from "@/utils";
import {
  createContract,
  deleteContract,
  openContractsTable,
  openVendorContract,
} from "@/utils/data/contract";
import { getCellSelector, getRowCount, openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(2 * 60000);
  await signIn(page);
  await openContractsTable(page);
});

test("Create Client Contract", async ({ page }) => {
  const name = "Contract 1";
  await createContract(page, { name, createNew: true });
  await deleteContract(page, name);
});

test("Review Client Contract", async ({ page }) => {
  const name = "Contract 2";
  await createContract(page, { name });
  await expect(page.locator(`${getCellSelector(2, 5)} [data-value="true"]`)).toBeVisible();
});

test("Update Client Contract", async ({ page }) => {
  const name = "Contract 3";
  await createContract(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  const id = getId();
  await page.waitForTimeout(1000);
  await page.fill("#shortId", id);
  await saveForm(page);

  await searchTable(page, id);
  await expect(await getRowCount(page)).toBe(1);
});

test("Delete Client Contract", async ({ page }) => {
  const name = "Contract 4";
  await createContract(page, { name });
  await deleteContract(page, name);
});

test("Create Vendor Contract", async ({ page }) => {
  const name = "Contract 5";
  await createContract(page, { name, createNew: true });
  await deleteContract(page, name);
});

test("Review Vendor Contract", async ({ page }) => {
  const name = "Contract 6";
  await createContract(page, { name });
  await expect(page.locator(`${getCellSelector(2, 6)} [data-value="true"]`)).toBeVisible();
});

test("Update Vendor Contract", async ({ page }) => {
  const name = "Contract 7";
  await createContract(page, { name });

  await searchTable(page, name);
  await openFirstRow(page);
  await openVendorContract(page);

  const id = getId();
  await page.fill("#shortId", id);
  await saveForm(page);

  await searchTable(page, id);
  await expect(await getRowCount(page)).toEqual(1);
});

test("Delete Vendor Contract", async ({ page }) => {
  const name = "Contract 8";
  await createContract(page, { name });
  await deleteContract(page, name);
});
