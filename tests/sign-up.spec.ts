import { expect, test } from "@playwright/test";

test("Sign Up", async ({ context, page, browser }) => {
  test.setTimeout(1.5 * 60000);
  context = await browser.newContext();
  page = await context.newPage();
  const page2 = await context.newPage();

  await page2.goto("https://internxt.com/temporary-email", {
    waitUntil: "domcontentloaded",
  });
  await expect(page2.locator(".w-full button.bg-white")).toContainText("@", {
    timeout: 60 * 1000,
  });
  const email = await page2.locator(".w-full button.bg-white").textContent();

  await page.goto(String(process.env.BASE_URL));
  await page.click("#signUp.bg-primary");

  await page.fill("#firstName", "John");
  await page.fill("#lastName", "Doe");
  await page.fill("#organizationName", "Test");
  await page.fill("#email", String(email));
  await page.fill("#password", String(process.env.PASSWORD));
  await page.click(".rounded #signUp");

  const verificationEmail = "no-reply@verificationemail.com";

  while ((await page2.locator(`[title="${verificationEmail}"]`).count()) === 0)
    await page2.click('[data-tooltip-id="arrows-clockwise"]');

  await page2.click(`[title="${verificationEmail}"]`);
  await expect(page2.locator("#inbox > .overflow-y-scroll")).toContainText(
    "Verify your new account",
    { timeout: 15 * 1000 },
  );

  const text = await page2.locator("#inbox > .overflow-y-scroll").textContent();

  if (text?.endsWith("Verification Link")) {
    const link = (await page2.getByText("Verification Link").getAttribute("href")) || "";

    const page3 = await context.newPage();
    await page3.goto(link);
    await page3.fill("#password", String(process.env.PASSWORD));
    await page3.click("#submit");

    await page3.waitForURL("/event", { timeout: 60 * 1000 });
    await page3.click("#avatar");
    await page3.click("#signOut");
  } else {
    const code = text?.slice(-6) || "";
    await page.fill("#confirmationCode", code);
    await page.click("#confirm");

    await page.waitForURL("/event", { timeout: 60 * 1000 });
    await page.click("#avatar");
    await page.click("#signOut");
  }
  await context.close();
});
