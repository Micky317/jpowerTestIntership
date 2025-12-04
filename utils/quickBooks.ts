import { Page } from "@playwright/test";

export const connectQuickBooks = async (page: Page) => {
  await page.click("#avatar");
  await page.click("#settings");
  const buttonText = await page.locator("#connect").textContent();

  if (buttonText === "Connect") {
    const popupPromise = page.waitForEvent("popup");
    await page.click("#connect");
    const popup = await popupPromise;
    await popup.fill(
      "#iux-identifier-first-international-email-user-id-input",
      String(process.env.QUICK_BOOKS_USERNAME),
    );
    await popup.getByTestId("IdentifierFirstSubmitButton").click();
    await popup.fill(
      "#iux-password-confirmation-password",
      String(process.env.QUICK_BOOKS_PASSWORD),
    );
    await popup.getByTestId("passwordVerificationContinueButton").click();
    await popup.click("#idsDropdownTypeaheadTextField2");
    await popup.click("#idsDropdownTypeahead1-item-0");
    await popup.click(".btn-next");
    await popup.waitForEvent("close");
  }
};
