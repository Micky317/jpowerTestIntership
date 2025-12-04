import { test } from "@playwright/test";
import { deleteForm, signIn } from "@/utils";
import { createUser } from "@/utils/data/user";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test("Verify User can be deleted and no longer displayed in the table", async ({ page }) => {
  const name = "User Delete 1";
  await createUser(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);
  await deleteForm(page);
});
