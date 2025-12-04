import { Page } from "@playwright/test";
import { saveForm } from "@/utils";
import { openServicesTable } from "@/utils/data/service";
import { selectOption } from "@/utils/input";
import { openFirstRow, searchTable } from "@/utils/table";

export const linkServiceToQuickBooks = async (page: Page) => {
  await openServicesTable(page);
  await searchTable(page, "Plowing");
  await openFirstRow(page);
  await selectOption(page, "#quickBooksAccount-id");
  await selectOption(page, "#quickBooksItem-id");
  await saveForm(page);
};
