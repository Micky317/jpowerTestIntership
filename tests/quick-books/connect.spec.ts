import test from "@playwright/test";
import { signIn } from "@/utils";
import { connectQuickBooks } from "@/utils/quickBooks";

test("QuickBooks Connect", async ({ page }) => {
  await signIn(page);
  await connectQuickBooks(page);
});
