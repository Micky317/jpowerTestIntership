import { expect, test } from "@playwright/test";
import { saveForm, signIn } from "@/utils";
import { createInvoice, openInvoicesTable } from "@/utils/data/invoice";
import { getCellSelector, openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(3 * 60000);
  await signIn(page);
});

test("Invoice create", async ({ page }) => {
  const name = "Invoice 1";
  await createInvoice(page, { name });
  await openInvoicesTable(page);
  await searchTable(page, name);
  await openFirstRow(page);
});

test("Invoice review correct data is displayed", async ({ page }) => {
  const name = "Invoice 2";
  await createInvoice(page, { name });
  await openInvoicesTable(page);
  await searchTable(page, name);
  await openFirstRow(page);
});

test("Invoice update", async ({ page }) => {
  const name = "Invoice 3";
  await createInvoice(page, { name });
  await openInvoicesTable(page);
  await searchTable(page, name);
  await openFirstRow(page);

  await page.fill("#billCredit", "100");
  await page.fill("#invoiceCredit", "100");
  await saveForm(page);
  await expect(page.locator(getCellSelector(2, 11))).toHaveText("$100.00");
});
