import test from "@playwright/test";
import { saveForm, signIn } from "@/utils";
import { bailoutTimeout, createBailout } from "@/utils/data/bailout";
import { selectOption } from "@/utils/input";
import { openFirstRow, searchTable } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(bailoutTimeout);
  await signIn(page);
});

test("Verify that a bailout status can be updated", async ({ page }) => {
  const name = "Bailout Update 1";
  await createBailout(page, { name });
  await searchTable(page, name);
  await openFirstRow(page);

  await selectOption(page, "#status", "Approved");
  await saveForm(page);
});
