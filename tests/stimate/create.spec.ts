import { expect, test } from '@playwright/test';
import { notesAndFiles, selectAddress } from '@/utils/input';
import { selectDropdownOption } from '@/utils/navigation/formHelpers';
import fs from 'fs';
import path from 'path';
import { signIn, uploadFile } from '@/utils';
import { fillContactCard, fillPropertyContactCard, validateContactCard, fillPropertyBillingContact } from '@/utils/contact';
import { clientTimeout, openClientsTable } from '@/utils/data/client';
import { selectZone } from '@/utils/data/zone';
import { addRoleToUser } from '@/utils/data/user';
import { selectOption, toggleCheckbox } from '@/utils/input';
import { openCreatePage } from '@/utils/table';
import { text } from 'stream/consumers';
import { profile } from 'console';
import { fill, get } from 'lodash';
import { fillSalesProperty } from '@/utils/data/property';

test.beforeEach(async ({ page }) => {
  test.setTimeout(clientTimeout);
  await signIn(page);
  await openClientsTable(page);

});
test("Verify that an item cannot be created if all required fields are not completed: Name", async ({
  page,
}) => {
  await page.click("#create");
  await expect(page.getByText('Name Required')).toBeVisible();

});


test("Verify that the Client and Main/ Billing Contact section can be filled", async ({ page }) => {
  await page.fill('#_r_2_', 'Anacortes Ferry Terminal, Anacortes, WA 98221, USA');
  await page.waitForTimeout(1000);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  await page.fill("#name", "Diaz Enterprises");
  await page.click('#priority');
  await page.click('#priority-High');
  await page.click('#salesRepId');
  await page.getByTestId('salesRepId-0').click();
  await page.click('#accountManagerId');
  await page.getByTestId('accountManagerId-0').click();
  await page.fill('#billingContact-firstName', 'John');
  await page.fill('#billingContact-lastName', 'Doe');
  await page.fill('#billingContact-title', 'contact');
  await page.fill('#billingContact-email', 'john.doe@example.com');
  await page.fill('#billingContact-phone', '1234567890');
  await page.click('#billingContact-phoneType');
  await page.click('#billingContact-phoneType-Mobile');
  await page.fill('#billingContact-secondaryPhone', '0987654321');
  await page.click('#billingContact-secondaryPhoneType');
  await page.click('#billingContact-secondaryPhoneType-Office');
  await page.waitForTimeout(1000);
  await page.click('#billingContact-isAutomaticInvoice');
  await page.locator('.ql-editor').evaluate((el, text) => {
    el.innerHTML = `<p>${text}</p>`;
  }, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');


  await expect(page.locator('#name')).toHaveValue('Diaz Enterprises');
  await expect(page.locator('#billingContact-firstName')).toHaveValue('John');
  await expect(page.locator('#billingContact-lastName')).toHaveValue('Doe');
  await expect(page.locator('#billingContact-title')).toHaveValue('contact');
  await expect(page.locator('#billingContact-email')).toHaveValue('john.doe@example.com');
  await expect(page.locator('#priority')).toHaveValue('High');
  await expect(page.locator('#salesRepId')).toHaveValue('Angel Fernandez');
  await expect(page.locator('#accountManagerId')).toHaveValue('Angel Fernandez');
  await expect(page.locator('#billingContact-isAutomaticInvoice')).toHaveAttribute('data-value', 'true');

});

test("Verification of data entered in the Main / Billing Contact", async ({ page }) => {
  await page.waitForTimeout(5000);
  const billingContactData = await fillContactCard(page, '#billingContact');
  await validateContactCard(page, '#billingContact', billingContactData);
});

test("add properti for the user", async ({ page }) => {
  await page.getByText('Walmart', { exact: true }).click();
  await page.click("#Properties");
  await page.click("#new");
  const addressInput = page.locator('input[type="address"]').nth(0);
  await addressInput.waitFor({ state: 'visible' });
  const dynamicAddressId = await addressInput.getAttribute('id');
  await selectAddress(page, `#${dynamicAddressId}`);
  await selectZone(page, '#zoneId', 40);
  await page.fill('#route', '1000');
  await fillPropertyContactCard(page, '#contact', 1);
  await page.click('#addBillingContact');
  await fillPropertyBillingContact(page, 0, 2);
  await notesAndFiles(page);
  await page.click('#create');

});









/*test.beforeAll(async ({page}) => {
    test.setTimeout(clientTimeout);
    await signIn(page);
    await openClientsTable(page);

  });*/