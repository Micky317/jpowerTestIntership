import { expect, test } from "@playwright/test";
import { signIn } from "@/utils";
import { createInvoice, openInvoicesTable } from "@/utils/data/invoice";
import { connectQuickBooks } from "@/utils/quickBooks";
import { getCellSelector, searchTable } from "@/utils/table";

test("QuickBooks Invoice", async ({ page }) => {
  test.setTimeout(4.5 * 60000);
  const name = "QuickBooks Invoice";

  await signIn(page);
  await connectQuickBooks(page);
  await createInvoice(page, { name });

  // VP APPROVE SERVICE
  await page.click("#open");
  await page.click("#markVpApproved");
  await page.waitForURL("**/event?**");

  // ACCOUNTING REVIEW SERVICE
  await openInvoicesTable(page);
  await searchTable(page, name);
  await page.click(getCellSelector(2, 0));
  await page.click("#review");
  await page.click("#review-submit");
  await expect(page.locator("#review-submit")).not.toBeVisible();

  // INVOICE
  await page.click("#invoice");
  await page.click("#invoice-submit");
  await expect(page.locator("#invoice-submit")).not.toBeVisible({ timeout: 20 * 1000 });

  // INVOICE PAID
  await page.click("#invoicePaid");
  await page.click("#invoicePaid-submit");
  await expect(page.locator("#invoicePaid-submit")).not.toBeVisible();

  // BILL PAID
  await page.click("#billPaid");
  await page.click("#billPaid-submit");
  await expect(page.locator("#billPaid-submit")).not.toBeVisible();
});
